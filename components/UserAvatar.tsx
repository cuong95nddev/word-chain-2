import React from 'react';
import Image from 'next/image';

interface UserAvatarProps {
  username: string;
  avatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function UserAvatar({
  username,
  avatarUrl,
  size = 'md',
  className = '',
}: UserAvatarProps) {
  // Kích thước cho từng size
  const sizeMap = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  // Lấy chữ cái đầu của tên
  const getInitials = (name: string): string => {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      // Lấy chữ cái đầu của từ đầu và từ cuối
      return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
    }
    // Nếu chỉ có một từ, lấy 2 chữ cái đầu hoặc chữ cái đầu lặp lại
    return (words[0].slice(0, 2) || words[0][0] + words[0][0]).toUpperCase();
  };

  // Tạo màu ngẫu nhiên nhưng ổn định cho mỗi user
  const getColorClass = (username: string): string => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];

    // Hash đơn giản để chọn màu
    const hash = username.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  };

  if (avatarUrl) {
    return (
      <div
        className={`relative rounded-full overflow-hidden ${sizeMap[size]} ${className}`}
      >
        <Image
          src={avatarUrl}
          alt={username}
          layout="fill"
          objectFit="cover"
          className="rounded-full"
        />
      </div>
    );
  }

  return (
    <div
      className={`
        ${sizeMap[size]}
        ${getColorClass(username)}
        rounded-full
        flex
        items-center
        justify-center
        text-white
        font-semibold
        ${className}
      `}
      title={username}
    >
      {getInitials(username)}
    </div>
  );
}

// Sử dụng với Skeleton loading
export function UserAvatarSkeleton({
  size = 'md',
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}) {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div
      className={`
        ${sizeMap[size]}
        rounded-full
        bg-gray-200
        animate-pulse
      `}
    />
  );
}
