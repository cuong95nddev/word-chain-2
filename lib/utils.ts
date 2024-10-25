import { Game, Player, Word, GameSettings } from '@/types';

export const calculateWordScore = (
  word: string,
  timeElapsed: number,
  settings: GameSettings,
  previousWords: Word[]
): number => {
  let score = word.length * settings.points_per_letter;

  if (word.length > 5) {
    score += settings.bonus_points.long_word;
  }

  if (timeElapsed < 5) {
    score += settings.bonus_points.quick_answer;
  }

  const streak = getPlayerStreak(word, previousWords);
  if (streak >= 3) {
    score += settings.bonus_points.streak;
  }

  return score;
};

export const getPlayerStreak = (currentWord: string, previousWords: Word[]): number => {
  let streak = 1;
  for (let i = previousWords.length - 1; i >= 0; i--) {
    if (previousWords[i].is_valid) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const getNextPlayer = (game: Game): Player => {
  const currentIndex = game.players.findIndex(p => p.id === game.current_player_id);
  const nextIndex = (currentIndex + 1) % game.players.length;
  return game.players[nextIndex];
};

export const isValidWord = (
  word: string,
  previousWord: string | undefined,
  settings: GameSettings,
  usedWords: string[]
): { isValid: boolean; error?: string } => {
  if (word.length < settings.min_word_length) {
    return { isValid: false, error: 'Từ quá ngắn' };
  }

  if (settings.max_word_length && word.length > settings.max_word_length) {
    return { isValid: false, error: 'Từ quá dài' };
  }

  if (!settings.allow_repeat_words && usedWords.includes(word.toLowerCase())) {
    return { isValid: false, error: 'Từ đã được sử dụng' };
  }

  if (previousWord) {
    const lastChar = previousWord[previousWord.length - 1];
    if (word[0].toLowerCase() !== lastChar.toLowerCase()) {
      return { isValid: false, error: `Từ phải bắt đầu bằng chữ "${lastChar}"` };
    }
  }

  return { isValid: true };
};
