import { Word } from '@/types';

interface WordChainProps {
  words: Word[];
  players: Record<string, { name: string; avatar_url?: string }>;
}

export default function WordChain({ words, players }: WordChainProps) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {words.map((word, index) => {
        const player = players[word.player_id];
        return (
          <div key={index} className="group relative">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                word.is_valid
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {word.text}
            </div>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
              <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                {player?.name}
                {word.score && ` • ${word.score} điểm`}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
