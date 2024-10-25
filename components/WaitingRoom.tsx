import { useState } from 'react';
import { Game, Player } from '@/types';

interface WaitingRoomProps {
  game: Game;
  currentPlayer: Player;
}

export default function WaitingRoom({ game, currentPlayer }: WaitingRoomProps) {
  const [copied, setCopied] = useState(false);
  const isHost = game.host_id === currentPlayer.id;
  const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL}/games/${game.id}`;

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startGame = async () => {
    if (!isHost) return;

    const response = await fetch(`/api/games/${game.id}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId: currentPlayer.id,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Phòng chờ</h2>

      <div className="mb-8">
        <h3 className="font-semibold mb-2">
          Người chơi ({game.players.length})
        </h3>
        <div className="grid gap-2">
          {game.players.map((player) => (
            <div
              key={player.id}
              className="p-3 bg-white border rounded-lg flex justify-between items-center"
            >
              <span>{player.name}</span>
              {player.id === game.host_id && (
                <span className="text-sm text-blue-500">Chủ phòng</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inviteLink}
            readOnly
            className="flex-1 p-2 bg-gray-50 border rounded-lg"
          />
          <button
            onClick={copyInviteLink}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {copied ? 'Đã copy!' : 'Copy link'}
          </button>
        </div>

        {isHost && (
          <button
            onClick={startGame}
            disabled={game.players.length < 2}
            className={`px-4 py-2 rounded-lg ${
              game.players.length < 2
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {game.players.length < 2
              ? 'Cần ít nhất 2 người chơi'
              : 'Bắt đầu trò chơi'}
          </button>
        )}
      </div>
    </div>
  );
}
