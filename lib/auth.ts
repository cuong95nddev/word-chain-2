import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import nextConfig from '@/next.config';

export const generateEmailFromUsername = (username: string) => {
  const normalizedUsername = username
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '.');

  return `${normalizedUsername}@wordchain.game`;
};

export const DEFAULT_PASSWORD = nextConfig.env?.DEFAULT_PASSWORD;

export const getServerSideAuth = async (context: any) => {
  const supabase = createServerSupabaseClient(context);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session)
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };

  return { props: { initialSession: session } };
};
