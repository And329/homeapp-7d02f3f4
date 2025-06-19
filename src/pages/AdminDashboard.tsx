
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyForm from '@/components/PropertyForm';
import PropertyRequestApprovalForm from '@/components/PropertyRequestApprovalForm';
import BlogPostForm from '@/components/BlogPostForm';
import NewsArticleForm from '@/components/NewsArticleForm';
import MapboxTokenSettings from '@/components/MapboxTokenSettings';
import AdminTabNavigation from '@/components/admin/AdminTabNavigation';
import AdminPropertiesTab from '@/components/admin/AdminPropertiesTab';
import AdminRequestsTab from '@/components/admin/AdminRequestsTab';
import AdminContentTab from '@/components/admin/AdminContentTab';
import AdminChatsTab from '@/components/admin/AdminChatsTab';
import { useAdminQueries } from '@/hooks/useAdminQueries';
import { useAdminMutations } from '@/hooks/useAdminMutations';
import { useAdminHandlers } from '@/hooks/useAdminHandlers';

const AdminDashboard = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const {
    properties,
    propertiesLoading,
    propertyRequests,
    requestsLoading,
    blogPosts,
    blogLoading,
    newsArticles,
    newsLoading,
    conversations,
    messages,
    selectedUserRequests,
  } = useAdminQueries(null, null); // Initialize with null first

  const mutations = useAdminMutations(profile, propertyRequests);

  const {
    // State management
    isFormOpen,
    setIsFormOpen,
    isBlogFormOpen,
    setIsBlogFormOpen,
    isNewsFormOpen,
    setIsNewsFormOpen,
    isApprovalFormOpen,
    setIsApprovalFormOpen,
    editingProperty,
    setEditingProperty,
    approvingRequest,
    setApprovingRequest,
    showMap,
    setShowMap,
    activeTab,
    setActiveTab,
    selectedConversation,
    selectedChatUserId,
    newMessage,
    setNewMessage,
    replyingToRequest,
    setReplyingToRequest,
    replyMessage,
    setReplyMessage,
    // Handlers
    handleEdit,
    handleDelete,
    handleApproveRequest,
    handleApprovalSubmit,
    handleRejectRequest,
    handleSendReply,
    handleSendChatMessage,
    handleConversationSelect,
  } = useAdminHandlers(mutations, propertyRequests);

  // Update queries with selected chat data
  const queriesWithChat = useAdminQueries(selectedConversation, selectedChatUserId);

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
            <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage properties, requests, content, and user communications</p>
        </div>

        <MapboxTokenSettings />

        <AdminTabNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          propertiesCount={properties.length}
          pendingRequestsCount={propertyRequests.filter(r => r.status === 'pending').length}
          openChatsCount={conversations.length}
        />

        {activeTab === 'properties' && (
          <AdminPropertiesTab
            properties={properties}
            propertiesLoading={propertiesLoading}
            showMap={showMap}
            setShowMap={setShowMap}
            onAddProperty={() => {
              setEditingProperty(null);
              setIsFormOpen(true);
            }}
            onEditProperty={handleEdit}
            onDeleteProperty={handleDelete}
          />
        )}

        {activeTab === 'requests' && (
          <AdminRequestsTab
            propertyRequests={propertyRequests}
            requestsLoading={requestsLoading}
            replyingToRequest={replyingToRequest}
            replyMessage={replyMessage}
            setReplyingToRequest={setReplyingToRequest}
            setReplyMessage={setReplyMessage}
            sendReplyMutation={mutations.sendReplyMutation}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
            onSendReply={handleSendReply}
          />
        )}

        {activeTab === 'content' && (
          <AdminContentTab
            blogPosts={blogPosts}
            newsArticles={newsArticles}
            blogLoading={blogLoading}
            newsLoading={newsLoading}
            onCreateBlogPost={() => setIsBlogFormOpen(true)}
            onCreateNewsArticle={() => setIsNewsFormOpen(true)}
          />
        )}

        {activeTab === 'chats' && (
          <AdminChatsTab />
        )}
      </div>

      {/* Modals */}
      {isFormOpen && (
        <PropertyForm
          property={editingProperty}
          onClose={() => {
            setIsFormOpen(false);
            setEditingProperty(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
            setIsFormOpen(false);
            setEditingProperty(null);
          }}
        />
      )}

      {isApprovalFormOpen && approvingRequest && (
        <PropertyRequestApprovalForm
          request={approvingRequest}
          onClose={() => {
            setIsApprovalFormOpen(false);
            setApprovingRequest(null);
          }}
          onApprove={handleApprovalSubmit}
        />
      )}

      {isBlogFormOpen && (
        <BlogPostForm
          onClose={() => setIsBlogFormOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
            setIsBlogFormOpen(false);
          }}
        />
      )}

      {isNewsFormOpen && (
        <NewsArticleForm
          onClose={() => setIsNewsFormOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-news-articles'] });
            setIsNewsFormOpen(false);
          }}
        />
      )}

      <Footer />
    </div>
  );
};

export default AdminDashboard;
