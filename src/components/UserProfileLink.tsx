
import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const UserProfileLink = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Link
      to="/profile"
      className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-primary transition-colors"
    >
      <User className="h-4 w-4" />
      <span>My Profile</span>
    </Link>
  );
};

export default UserProfileLink;
