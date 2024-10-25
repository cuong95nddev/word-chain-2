import { NextApiRequest, NextApiResponse } from 'next';
import { generateFirstWord } from '@/lib/openai';
import { supabase } from '@/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body;

  try {
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    const firstWord = await generateFirstWord();

    const { data, error } = await supabase
      .from('games')
      .insert({
        host_id: userId,
        players: [
          {
            id: userId,
            name: userProfile?.username || 'Unknown',
            score: 0,
            is_active: true,
          },
        ],
        words: [
          {
            text: firstWord,
          },
        ],
        settings: {
          max_players: 4,
          time_limit: 15,
          win_points: 1000,
          min_word_length: 2,
          max_word_length: 20,
          language: 'vi',
          allow_repeat_words: false,
          points_per_letter: 10,
          bonus_points: {
            long_word: 20,
            quick_answer: 15,
            streak: 25,
          },
        },
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error updating game state:', error);
    return res.status(500).json({ error: 'Error updating game state' });
  }
}
