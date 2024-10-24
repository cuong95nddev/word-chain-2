import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data: userProfiles, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('total_score', { ascending: false })
      .limit(50);

    if (error) throw error;

    const leaderboard = userProfiles.map((profile) => ({
      userId: profile.user_id,
      username: profile.username,
      displayName: profile.display_name,
      totalGames: profile.total_games,
      wins: profile.total_wins,
      totalScore: profile.total_score,
      winRate:
        profile.total_games > 0 ? profile.total_wins / profile.total_games : 0,
      averageScore:
        profile.total_games > 0 ? profile.total_score / profile.total_games : 0,
    }));

    return res.status(200).json(leaderboard);
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({ error: error.message });
  }
}
