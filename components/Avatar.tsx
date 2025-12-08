import React from 'react';

interface AvatarProps {
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  src = 'https://picsum.photos/200/200', 
  size = 'md', 
  border = false 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className={`relative rounded-full overflow-hidden ${sizeClasses[size]} ${border ? 'border-2 border-white ring-2 ring-gray-100' : ''}`}>
      <img 
        src={src} 
        alt="User Avatar" 
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
};