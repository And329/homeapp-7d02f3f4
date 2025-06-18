
import React from 'react';

interface AdminStatsProps {
  propertiesCount: number;
  pendingRequestsCount: number;
  openChatsCount: number;
}

const AdminStats: React.FC<AdminStatsProps> = ({
  propertiesCount,
  pendingRequestsCount,
  openChatsCount,
}) => {
  return (
    <div className="mb-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button className="py-2 px-1 border-b-2 border-primary text-primary font-medium text-sm">
            Published Properties ({propertiesCount})
          </button>
          <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 font-medium text-sm">
            Property Requests ({pendingRequestsCount} pending)
          </button>
          <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 font-medium text-sm">
            Content Management
          </button>
          <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 font-medium text-sm">
            User Chats ({openChatsCount} open)
          </button>
        </nav>
      </div>
    </div>
  );
};

export default AdminStats;
