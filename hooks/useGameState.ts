import { useCallback, useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Game } from '@/types';
import { useGameSubscription } from '@/hooks/useGameSubscription';

export function useGameState(gameId: string, key: string) {
  const supabase = useSupabaseClient();
  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGame = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (error) throw error;
      setGame(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [gameId, supabase]);

  useGameSubscription(key, gameId, (updatedGame) => {
    setGame(updatedGame);
  });

  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  return { game, error, isLoading };
}
