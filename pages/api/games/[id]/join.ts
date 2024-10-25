import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { userId } = req.body;

  try {
    const { data: game } = await supabase
      .from('games')
      .select('*')
      .eq('id', id)
      .single();

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.status !== 'waiting') {
      return res.status(400).json({ error: 'Game has already started' });
    }

    if (game.players.length >= game.settings.max_players) {
      return res.status(400).json({ error: 'Game is full' });
    }

    if (game.players.some((p: any) => p.id === userId)) {
      return res.status(400).json({ error: 'Already joined' });
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('user_id', userId)
      .single();

    const { data: updatedGame, error } = await supabase
      .from('games')
      .update({
        players: [
          ...game.players,
          {
            id: userId,
            name: profile?.username,
            score: 0,
            is_active: true,
          },
        ],
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json(updatedGame);
  } catch (error: any) {
    console.error('Error joining game:', error);
    return res.status(500).json({ error: error.message });
  }
}
