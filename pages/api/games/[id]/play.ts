import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { validateWord } from '@/lib/openai';
import { Player, Word } from '@/types';
import { calculateWordScore } from '@/lib/utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { word, playerId } = req.body;

  try {
    // Validate input
    if (!word || !playerId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fetch current game state
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('id', id)
      .single();

    if (gameError || !game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Validate game state
    if (game.status !== 'playing') {
      return res.status(400).json({ error: 'Game is not in playing state' });
    }

    if (game.current_player_id != playerId) {
      return res.status(400).json({ error: 'Not your turn' });
    }

    // Validate word length
    if (word.length < game.settings.min_word_length) {
      return res.status(400).json({
        error: `Từ phải có ít nhất ${game.settings.min_word_length} ký tự`,
      });
    }

    if (
      game.settings.max_word_length &&
      word.length > game.settings.max_word_length
    ) {
      return res.status(400).json({
        error: `Từ không được dài quá ${game.settings.maxWordLength} ký tự`,
      });
    }

    // Check if word has been used
    const usedWords = game.words.map((w: Word) => w.text.toLowerCase());
    if (
      !game.settings.allow_repeat_words &&
      usedWords.includes(word.toLowerCase())
    ) {
      return res.status(400).json({ error: 'Từ này đã được sử dụng' });
    }

    // Check if word follows the chain rule
    if (game.words.length > 0) {
      const lastWord = game.words[game.words.length - 1].text;
      const lastChar = lastWord[lastWord.length - 1];
      if (word[0].toLowerCase() !== lastChar.toLowerCase()) {
        return res.status(400).json({
          error: `Từ phải bắt đầu bằng chữ "${lastChar}"`,
        });
      }
    }

    // Validate word with OpenAI
    const isValid = await validateWord(
      word,
      game.words.length > 0 ? game.words[game.words.length - 1].text : undefined
    );

    if (!isValid) {
      return res.status(400).json({ error: 'Từ không hợp lệ' });
    }

    // Calculate score
    const timeElapsed =
      (Date.now() - new Date(game.last_word_at).getTime()) / 1000;
    const score = calculateWordScore(
      word,
      timeElapsed,
      game.settings,
      game.words
    );

    // Find next player
    const players = game.players as Player[];
    const currentPlayerIndex = players.findIndex((p) => p.id === playerId);
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    const nextPlayerId = players[nextPlayerIndex].id;

    // Check for game end conditions
    let gameStatus = game.status;
    let winnerId = null;
    // if (timeElapsed >= game.settings.time_limit) {
    //   gameStatus = 'finished';
    //   // Find player with highest score
    //   const highestScore = Math.max(...players.map((p) => p.score));
    //   const winner = players.find((p) => p.score === highestScore);
    //   winnerId = winner?.id;
    // }

    // Update player stats
    const updatedPlayers = players.map((p) => {
      if (p.id === playerId) {
        const recentWords = p.recent_words || [];
        return {
          ...p,
          score: p.score + score,
          last_played_at: Date.now(),
          recent_words: [word, ...recentWords].slice(0, 3),
        };
      }
      return p;
    });

    // Create new word record
    const newWord: Word = {
      text: word,
      player_id: playerId,
      timestamp: Date.now(),
      is_valid: true,
      score,
    };

    // Update game state
    const { data: updatedGame, error: updateError } = await supabase
      .from('games')
      .update({
        words: [...game.words, newWord],
        current_player_id: nextPlayerId,
        last_word_at: new Date().toISOString(),
        players: updatedPlayers,
        status: gameStatus,
        winner_id: winnerId,
        round: game.round + 1,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Insert word history
    await supabase.from('game_words').insert({
      game_id: id,
      user_id: playerId,
      word,
      score,
      is_valid: true,
      response_time: Math.round(timeElapsed),
      played_at: new Date().toISOString(),
    });

    // Update user stats if game ended
    if (gameStatus === 'finished') {
      const { data: currentStats, error: fetchError } = await supabase
        .from('user_profiles')
        .select('total_games, total_score, total_wins')
        .eq('user_id', playerId)
        .single();

      if (fetchError) {
        console.error('Error fetching user stats:', fetchError);
      } else {
        // Sau đó cập nhật với giá trị mới
        const { error: statsError } = await supabase
          .from('user_profiles')
          .update({
            total_games: (currentStats?.total_games || 0) + 1,
            total_score: (currentStats?.total_score || 0) + score,
            total_wins:
              (currentStats?.total_wins || 0) + (playerId === winnerId ? 1 : 0),
          })
          .eq('user_id', playerId);

        if (statsError) {
          console.error('Error updating user stats:', statsError);
        }
      }
    }

    // Return updated game state
    return res.status(200).json(updatedGame);
  } catch (error: any) {
    console.error('Error playing word:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
}
