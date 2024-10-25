import { useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Game } from '@/types';

export function useGameSubscription(
  key: string,
  gameId: string,
  onUpdate: (game: Game) => void
) {
  const supabase = useSupabaseClient();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const subscription = supabase
      .channel(`game:${gameId}:${key}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          console.log('Game updated:', payload.new, onUpdate);
          onUpdate(payload.new as Game);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [gameId, supabase, onUpdate]);
}
