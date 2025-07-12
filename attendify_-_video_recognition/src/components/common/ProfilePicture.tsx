import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';

interface ProfilePictureProps {
  storageId?: Id<'_storage'>;
  name: string;
  size?: number;
  className?: string;
  onClick?: () => void;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({ 
  storageId, 
  name, 
  size = 32, 
  className = '',
  onClick 
}) => {
  const url = useQuery(
    api.userProfiles.getProfilePictureUrl, 
    storageId ? { profilePictureId: storageId } : "skip"
  );

  const baseClasses = `rounded-full object-cover flex-shrink-0 ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all' : ''} ${className}`;
  const style = { width: size, height: size };

  if (storageId && url) {
    return (
      <img
        src={url}
        alt={`${name}'s profile`}
        className={baseClasses}
        style={style}
        onClick={onClick}
      />
    );
  }

  // Fallback to initials
  return (
    <div 
      className={`bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all' : ''} ${className}`}
      style={style}
      onClick={onClick}
    >
      <span 
        className="text-white font-bold" 
        style={{ fontSize: size / 2.5 }}
      >
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
};

export default ProfilePicture;
