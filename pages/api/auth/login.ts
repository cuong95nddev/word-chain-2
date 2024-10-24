import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { generateEmailFromUsername, DEFAULT_PASSWORD } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const email = generateEmailFromUsername(username);

    // Try to sign in first
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password: DEFAULT_PASSWORD!,
      });

    if (signInError?.message.includes('Invalid login credentials')) {
      // If account doesn't exist, create one
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password: DEFAULT_PASSWORD!,
          options: {
            data: {
              username,
            },
          },
        });

      if (signUpError) throw signUpError;

      // Update user profile
      await supabase.from('user_profiles').upsert({
        user_id: signUpData.user?.id,
        username,
        display_name: username,
        created_at: new Date().toISOString(),
      });

      return res.status(200).json(signUpData);
    }

    if (signInError) throw signInError;

    return res.status(200).json(signInData);
  } catch (error: any) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: error.message });
  }
}
