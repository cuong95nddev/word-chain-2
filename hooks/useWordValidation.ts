import { useState } from 'react';
import { validateWord } from '@/lib/openai';
import { Word, GameSettings } from '@/types';

export function useWordValidation(settings: GameSettings) {
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateGameWord = async (
    word: string,
    previousWords: Word[]
  ): Promise<boolean> => {
    setIsValidating(true);
    setError(null);

    try {
      if (word.length < settings.min_word_length) {
        setError(`Từ phải có ít nhất ${settings.min_word_length} ký tự`);
        return false;
      }

      if (settings.max_word_length && word.length > settings.max_word_length) {
        setError(`Từ không được dài quá ${settings.max_word_length} ký tự`);
        return false;
      }

      if (
        !settings.allow_repeat_words &&
        previousWords.some((w) => w.text.toLowerCase() === word.toLowerCase())
      ) {
        setError('Từ này đã được sử dụng');
        return false;
      }

      if (previousWords.length > 0) {
        const lastWord = previousWords[previousWords.length - 1].text;
        const lastChar = lastWord[lastWord.length - 1];
        if (word[0].toLowerCase() !== lastChar.toLowerCase()) {
          setError(`Từ phải bắt đầu bằng chữ "${lastChar}"`);
          return false;
        }
      }

      // const isValid = await validateWord(
      //   word,
      //   previousWords.length > 0
      //     ? previousWords[previousWords.length - 1].text
      //     : undefined
      // );

      const isValid = true;

      if (!isValid) {
        setError('Từ không hợp lệ');
      }

      return isValid;
    } catch (error) {
      setError('Có lỗi xảy ra khi kiểm tra từ');
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  return { validateGameWord, isValidating, error };
}
