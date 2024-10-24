'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const generateEmailFromUsername = (username: string) => {
    const normalizedUsername = username
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '.');

    return `${normalizedUsername}@wordchain.game`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      const email = generateEmailFromUsername(username);
      const password = '123456'; // Default password

      // Thử đăng nhập
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      // Nếu không có tài khoản, tạo mới
      if (signInError?.message.includes('Invalid login credentials')) {
        const { data: signUpData, error: signUpError } =
          await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                username: username.trim(),
              },
            },
          });

        if (signUpError) throw signUpError;

        // Tạo profile cho user mới
        if (signUpData.user) {
          await supabase.from('user_profiles').insert({
            user_id: signUpData.user.id,
            username: username.trim(),
            display_name: username.trim(),
            total_games: 0,
            total_wins: 0,
            total_score: 0,
          });
        }

        router.push('/dashboard');
        return;
      }

      if (signInError) throw signInError;

      router.push('/dashboard');
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Logo or Game Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Nối Chữ</h1>
            <p className="mt-2 text-gray-600">Nhập tên để bắt đầu chơi</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Tên của bạn
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ví dụ: Cuong Pham"
                  className="input"
                  required
                  autoFocus
                  minLength={2}
                  maxLength={50}
                  disabled={isLoading}
                />
              </div>
              {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading || !username.trim()}
              className={`btn btn-primary w-full flex items-center justify-center ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Đang xử lý...
                </>
              ) : (
                'Vào Game'
              )}
            </button>
          </form>

          {/* Game Rules or Info */}
          <div className="mt-8 text-sm text-gray-600">
            <h2 className="font-medium text-gray-900 mb-2">Luật chơi:</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Mỗi người chơi lần lượt nhập một từ</li>
              <li>Từ mới phải bắt đầu bằng chữ cuối của từ trước</li>
              <li>Có 30 giây để suy nghĩ và nhập từ</li>
              <li>Điểm số dựa trên độ dài từ và thời gian trả lời</li>
            </ul>
          </div>
        </div>

        {/* Optional: Version or Credits */}
        <div className="mt-4 text-center text-sm text-gray-500">
          Version 1.0.0 • Made with ❤️
        </div>
      </div>
    </div>
  );
}
