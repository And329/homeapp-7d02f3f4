
import React from 'react';

interface AdminTabNavigationProps {
  activeTab: 'properties' | 'requests' | 'content' | 'chats';
  setActiveTab: (tab: 'properties' | 'requests' | 'content' | 'chats') => void;
  propertiesCount: number;
  pendingRequestsCount: number;
  openChatsCount: number;
}

const AdminTabNavigation: React.FC<AdminTabNavigationProps> = ({
  activeTab,
  setActiveTab,
  propertiesCount,
  pendingRequestsCount,
  openChatsCount,
}) => {
  return (
    <div className="mb-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('properties')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'properties'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Published Properties ({propertiesCount})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'requests'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Property Requests ({pendingRequestsCount} pending)
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'content'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Content Management
          </button>
          <button
            onClick={() => setActiveTab('chats')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'chats'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Chats ({openChatsCount} active)
          </button>
        </nav>
      </div>
    </div>
  );
};

export default AdminTabNavigation;
