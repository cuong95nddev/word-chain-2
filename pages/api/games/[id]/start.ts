import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { getNextPlayer } from '@/lib/utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { playerId } = req.body;

  try {
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
    if (game.status !== 'waiting') {
      return res.status(400).json({ error: 'Game is not in waiting state' });
    }

    // Validate player
    if (game.host_id !== playerId) {
      return res.status(400).json({ error: 'Only the host can start the game' });
    }

    const nextPlayer = getNextPlayer(game);

    // Update game state
    const updatedGame = await supabase
      .from('games')
      .update({
        status: 'playing',
        current_player_id: nextPlayer.id,
      })
      .eq('id', id)
      .single();

    return res.status(200).json(updatedGame);
  } catch (error) {
    console.error('Error updating game state:', error);
    return res.status(500).json({ error: 'Error updating game state' });
  }
}
