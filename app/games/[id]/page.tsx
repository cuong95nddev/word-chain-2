'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import GameBoard from '@/components/GameBoard';
import WaitingRoom from '@/components/WaitingRoom';
import GameOver from '@/components/GameOver';
import { Player } from '@/types';
import { useGameState } from '@/hooks/useGameState';
import { useUser } from '@supabase/auth-helpers-react';

export default function GamePage() {
  const router = useRouter();
  const params = useParams();
  const gameId = params?.id as string;
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { game, isLoading } = useGameState(gameId, 'page');
  const user = useUser();

  useEffect(() => {
    (async () => {
      if (!game || !user) return;

      // Find or create player
      const player = game.players.find((p: any) => p.id === user.id);
      if (player) {
        setCurrentPlayer(player);
      } else if (
        game.status === 'waiting' &&
        game.players.length < game.settings.max_players
      ) {
        const response = await fetch(`/api/games/${gameId}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error);
        }
      } else {
        // Game is full or already started
        setError(
          game.status === 'waiting'
            ? 'Phòng đã đủ người'
            : 'Trò chơi đã bắt đầu'
        );
      }
    })();
  }, [game, user]);

  if (isLoading || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
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

  if (!game) {
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
