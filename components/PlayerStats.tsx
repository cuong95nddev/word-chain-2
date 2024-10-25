import React from 'react';
import { Game, Player } from '@/types';
import UserAvatar from './UserAvatar';
import Timer from '@/components/Timer';

interface PlayerStatsProps {
  player: Player;
  game: Game;
  isCurrentTurn: boolean;
  isYourTurn: boolean;
  onlineStatus?: 'online' | 'offline' | 'away';
}

export default function PlayerStats({
  player,
  game,
  isCurrentTurn,
  isYourTurn,
  onlineStatus = 'online',
}: PlayerStatsProps) {
  return (
    <div
      className={`p-4 rounded-lg transition-all duration-200 ${
        isCurrentTurn
          ? 'bg-blue-50 border-2 border-blue-200 shadow-sm'
          : 'bg-white border border-gray-200'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <UserAvatar username={player.name} size="md" />
          <div
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              onlineStatus === 'online'
                ? 'bg-green-500'
                : onlineStatus === 'away'
                  ? 'bg-yellow-500'
                  : 'bg-gray-500'
            }`}
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">{player.name}</h3>
            {isCurrentTurn && (
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                Đang chơi
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{player.score} điểm</span>
            </div>

            {player.last_played_at && (
              <div className="text-xs text-gray-500">
                Lần cuối: {new Date(player.last_played_at).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar for timer when it's player's turn */}
      {isCurrentTurn && !isYourTurn && (
        <div className="mt-3">
          <Timer duration={game.settings.time_limit} isActive={isCurrentTurn} />
        </div>
      )}

      {/* Recent words */}
      {player.recent_words && player.recent_words.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {player.recent_words.slice(0, 3).map((word, index) => (
            <span
              key={index}
              className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
            >
              {word}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
