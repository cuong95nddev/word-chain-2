import { useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Game } from '@/types';

export function useGameSubscription(
  gameId: string,
  onUpdate: (game: Game) => void
) {
  const supabase = useSupabaseClient();

  useEffect(() => {
    const subscription = supabase
      .channel(`game:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          onUpdate(payload.new as Game);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [gameId, onUpdate, supabase]);
}
