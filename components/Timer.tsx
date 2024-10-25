import { useState, useEffect } from 'react';
import { formatTime } from '@/lib/utils';

interface TimerProps {
  duration: number;
  onTimeout?: () => void;
  isActive: boolean;
}

export default function Timer({ duration, onTimeout, isActive }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeout?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, onTimeout]);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  return (
    <div className="text-center">
      <div
        className={`text-2xl font-bold ${
          timeLeft < 10 ? 'text-red-500' : 'text-gray-700'
        }`}
      >
        {formatTime(timeLeft)}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            timeLeft < 10 ? 'bg-red-500' : 'bg-blue-500'
          }`}
          style={{ width: `${(timeLeft / duration) * 100}%` }}
        />
      </div>
    </div>
  );
}
