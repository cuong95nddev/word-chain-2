import React, { useState } from 'react';
import { Player } from '@/types';
import Timer from './Timer';
import WordChain from './WordChain';
import PlayerStats from './PlayerStats';
import { useGameState } from '@/hooks/useGameState';

interface GameBoardProps {
  gameId: string;
  currentPlayer: Player;
}

export default function GameBoard({ gameId, currentPlayer }: GameBoardProps) {
  const [inputWord, setInputWord] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { game } = useGameState(gameId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!game || !inputWord.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const word = inputWord.trim().toLowerCase();

      // Submit word
      const response = await fetch(`/api/games/${gameId}/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word,
          playerId: currentPlayer.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      setInputWord('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimeOut = async () => {
    if (!game || game.current_player_id !== currentPlayer.id) return;

    const response = await fetch(`/api/games/${gameId}/timeout`, {
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

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  const isCurrentTurn = game.current_player_id === currentPlayer.id;

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Game Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Phòng chơi #{gameId.slice(0, 8)}
          </h1>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Players List */}
        <div className="md:col-span-1 space-y-4">
          {game.players.map((player) => (
            <PlayerStats
              key={player.id}
              player={player}
              isCurrentTurn={game.current_player_id === player.id}
            />
          ))}
        </div>

        {/* Game Play Area */}
        <div className="md:col-span-2 space-y-6">
          {/* Timer */}
          {isCurrentTurn && (
            <Timer
              duration={game.settings.time_limit}
              onTimeout={handleTimeOut}
              isActive={isCurrentTurn}
            />
          )}

          {/* Word Chain */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Chuỗi từ</h2>
            <WordChain
              words={game.words}
              players={game.players.reduce(
                (acc, player) => ({
                  ...acc,
                  [player.id]: player,
                }),
                {}
              )}
            />
          </div>

          {/* Input Area */}
          {isCurrentTurn && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={inputWord}
                  onChange={(e) => setInputWord(e.target.value)}
                  className={`w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={
                    isCurrentTurn
                      ? game.words.length > 0
                        ? `Nhập từ bắt đầu bằng chữ "${game.words[
                            game.words.length - 1
                          ].text.slice(-1)}"`
                        : 'Nhập từ bất kỳ để bắt đầu...'
                      : 'Đang chờ lượt...'
                  }
                  disabled={!isCurrentTurn || isSubmitting}
                />
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={!isCurrentTurn || isSubmitting}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                  isCurrentTurn && !isSubmitting
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Đang kiểm tra...
                  </span>
                ) : (
                  'Gửi'
                )}
              </button>
            </form>
          )}

          {/* Game Rules */}
          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
            <h3 className="font-semibold mb-2">Luật chơi:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Mỗi từ phải bắt đầu bằng chữ cuối của từ trước</li>
              <li>Thời gian suy nghĩ: {game.settings.time_limit} giây</li>
              <li>
                Độ dài từ: {game.settings.min_word_length} -{' '}
                {game.settings.max_word_length} ký tự
              </li>
              {!game.settings.allow_repeat_words && (
                <li>Không được dùng lại từ đã sử dụng</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
