'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import UserAvatar from '@/components/UserAvatar';
import { Game, UserProfile } from '@/types';

export default function Page() {
  const router = useRouter();
  const user = useUser();
  const supabase = useSupabaseClient();
  const [rooms, setRooms] = useState<Game[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setUserProfile(profile);
        }

        // Fetch active rooms
        const { data: activeRooms } = await supabase
          .from('games')
          .select('*')
          .in('status', ['waiting', 'playing'])
          .order('created_at', { ascending: false });

        if (activeRooms) {
          setRooms(activeRooms);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Subscribe to game updates
    const gamesSubscription = supabase
      .channel('games')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setRooms((prev) => [payload.new as Game, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setRooms((prev) =>
              prev.map((room) =>
                room.id === payload.new.id ? { ...(payload.new as Game) } : room
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setRooms((prev) =>
              prev.filter((room) => room.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      gamesSubscription.unsubscribe();
    };
  }, [user, supabase]);

  const createRoom = async () => {
    if (!user || createLoading) return;

    try {
      setCreateLoading(true);

      const { data, error } = await supabase
        .from('games')
        .insert({
          host_id: user.id,
          players: [{
            id: user.id,
            name: userProfile?.username || user.email?.split('@')[0] || 'Unknown',
            score: 0,
            is_active: true
          }],
          settings: {
            max_players: 4,
            time_limit: 30,
            min_word_length: 2,
            max_word_length: 10,
            language: 'vi',
            allow_repeat_words: false,
            points_per_letter: 10,
            bonus_points: {
              long_word: 20,
              quick_answer: 15,
              streak: 25
            }
          }
        })
        .select()
        .single();

      if (error) throw error;
      router.push(`/games/${data.id}`);
    } catch (error) {
      console.error('Error creating room:', error);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.refresh(); // Force a refresh of the current page
      router.push('/auth/login'); // Manually redirect
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <UserAvatar
                username={userProfile?.username || user?.email?.split('@')[0] || 'Unknown'}
                size="lg"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {userProfile?.username || user?.email?.split('@')[0]}
                </h2>
                {userProfile && (
                  <div className="mt-1 text-sm text-gray-500 space-x-4">
                    <span>{userProfile.total_games} trận đã chơi</span>
                    <span>•</span>
                    <span>{userProfile.total_wins} chiến thắng</span>
                    <span>•</span>
                    <span>
                      {userProfile.total_games > 0
                        ? `${Math.round(
                          (userProfile.total_wins / userProfile.total_games) * 100
                        )}% tỉ lệ thắng`
                        : '0% tỉ lệ thắng'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700"
            >
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-8">
          <button
            onClick={createRoom}
            disabled={createLoading}
            className={`w-full sm:w-auto px-6 py-3 bg-blue-500 text-white rounded-lg font-medium
              hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${createLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {createLoading ? (
              <span className="flex items-center">
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
                Đang tạo phòng...
              </span>
            ) : (
              'Tạo phòng mới'
            )}
          </button>
        </div>

        {/* Room List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">Danh sách phòng</h3>
          </div>

          {rooms.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Chưa có phòng nào. Hãy tạo phòng mới để bắt đầu!
            </div>
          ) : (
            <div className="divide-y">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-medium text-gray-900">
                          Phòng #{room.id.slice(0, 8)}
                        </h4>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            room.status === 'waiting'
                              ? 'bg-yellow-100 text-yellow-800'
                              : room.status === 'playing'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {room.status === 'waiting'
                            ? 'Đang chờ'
                            : room.status === 'playing'
                              ? 'Đang chơi'
                              : 'Kết thúc'}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {room.players.length} người chơi • Tạo bởi{' '}
                        {room.players[0]?.name || 'Unknown'}
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/games/${room.id}`)}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        room.status === 'waiting'
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {room.status === 'waiting' ? 'Tham gia' : 'Xem'}
                    </button>
                  </div>

                  {/* Player Avatars */}
                  <div className="mt-4 flex -space-x-2 overflow-hidden">
                    {room.players.map((player, index) => (
                      <UserAvatar
                        key={player.id}
                        username={player.name}
                        size="sm"
                        className={`inline-block ring-2 ring-white ${
                          index === 0 ? 'z-30' : index === 1 ? 'z-20' : 'z-10'
                        }`}
                      />
                    ))}
                    {room.settings.max_players > room.players.length && (
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 ring-2 ring-white">
                        <span className="text-xs text-gray-500">
                          +{room.settings.max_players - room.players.length}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
