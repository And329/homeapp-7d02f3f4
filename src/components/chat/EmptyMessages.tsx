import React from 'react';

export const EmptyMessages: React.FC = () => {
  return (
    <div className="text-center py-8 text-gray-500">
      <div className="text-gray-300 mb-3">
        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <p className="font-medium">No messages yet</p>
      <p className="text-sm">Start the conversation by sending a message below</p>
    </div>
  );
};