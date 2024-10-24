import { Game } from '@/types';

interface GameOverProps {
  game: Game;
}

export default function GameOver({ game }: GameOverProps) {
  const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  return (
    <div className="max-w-2xl mx-auto p-4 text-center">
      <h2 className="text-3xl font-bold mb-8">Trò chơi kết thúc!</h2>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">🏆 Người chiến thắng</h3>
        <div className="p-6 bg-yellow-100 rounded-lg">
          <div className="text-2xl font-bold text-yellow-800">
            {winner.name}
          </div>
          <div className="text-yellow-700">{winner.score} điểm</div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Bảng xếp hạng</h3>
        <div className="space-y-2">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className={`p-4 rounded-lg flex justify-between items-center ${
                index === 0
                  ? 'bg-yellow-100'
                  : index === 1
                    ? 'bg-gray-100'
                    : index === 2
                      ? 'bg-orange-100'
                      : 'bg-white border'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold">{index + 1}</span>
                <span>{player.name}</span>
              </div>
              <span className="font-semibold">{player.score} điểm</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-x-4">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Chơi lại
        </button>
        <a
          href="/dashboard"
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 inline-block"
        >
          Về trang chủ
        </a>
      </div>
    </div>
  );
}
