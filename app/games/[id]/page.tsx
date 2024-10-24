'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import GameBoard from '@/components/GameBoard';
import WaitingRoom from '@/components/WaitingRoom';
import GameOver from '@/components/GameOver';
import { Game, Player } from '@/types';
import { useGameSubscription } from '@/hooks/useGameSubscription';

export default function GamePage() {
  const router = useRouter();
  const params = useParams();
  const gameId = params?.id as string;
  const [game, setGame] = useState<Game | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useGameSubscription(gameId, (updatedGame) => {
    setGame(updatedGame);
  });

  useEffect(() => {
    const fetchGame = async () => {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/login');
          return;
        }

        // Fetch game data
        const { data: gameData, error: gameError } = await supabase
          .from('games')
          .select('*')
          .eq('id', gameId)
          .single();

        if (gameError) throw gameError;

        setGame(gameData);

        // Find or create player
        const player = gameData.players.find((p: any) => p.id === user.id);
        if (player) {
          setCurrentPlayer(player);
        } else if (
          gameData.status === 'waiting' &&
          gameData.players.length < gameData.settings.max_players
        ) {
          // Get user profile
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('username')
            .eq('user_id', user.id)
            .single();

          const newPlayer: Player = {
            id: user.id,
            name: profile?.username || user.email?.split('@')[0] || 'Unknown',
            score: 0,
            is_active: true,
          };

          // Add player to game
          const { error: updateError } = await supabase
            .from('games')
            .update({
              players: [...gameData.players, newPlayer],
            })
            .eq('id', gameId);

          if (updateError) throw updateError;
          setCurrentPlayer(newPlayer);
        } else {
          // Game is full or already started
          setError(
            gameData.status === 'waiting'
              ? 'Phòng đã đủ người'
              : 'Trò chơi đã bắt đầu'
          );
        }
      } catch (err: any) {
        console.error('Error fetching game:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGame();
  }, [gameId, router, supabase]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Không thể tham gia trò chơi
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn btn-primary"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (!game || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Không tìm thấy trò chơi
          </h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn btn-primary"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (game.status === 'waiting') {
    return <WaitingRoom game={game} currentPlayer={currentPlayer} />;
  }

  if (game.status === 'finished') {
    return <GameOver game={game} />;
  }

  return <GameBoard gameId={game.id} currentPlayer={currentPlayer} />;
}
