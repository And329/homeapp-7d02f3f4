
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
import { useAdminState } from '@/hooks/useAdminState';
import { transformDatabaseProperty } from '@/utils/propertyTransform';

const AdminDashboard = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const state = useAdminState();

  const {
    properties: rawProperties,
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
  } = useAdminQueries(state.selectedConversation, state.selectedChatUserId);

  // Transform database properties to match the expected Property interface
  const properties = rawProperties.map(transformDatabaseProperty);

  const mutations = useAdminMutations(profile, propertyRequests);

  const handlers = useAdminHandlers(
    queryClient,
    mutations.sendReplyMutation,
    mutations.sendChatMessageMutation,
    mutations.deleteMutation,
    state
  );

  // Updated handlers to work with transformed properties and string IDs
  const handleEdit = (property: any) => {
    // Convert back to database format for editing
    const dbProperty = {
      ...property,
      is_hot_deal: property.isHotDeal,
      latitude: property.coordinates?.lat,
      longitude: property.coordinates?.lng,
    };
    handlers.handleEdit(dbProperty);
  };

  const handleDelete = async (id: string) => {
    await handlers.handleDelete(id);
  };

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
          activeTab={state.activeTab}
          setActiveTab={state.setActiveTab}
          propertiesCount={properties.length}
          pendingRequestsCount={propertyRequests.filter(r => r.status === 'pending').length}
          openChatsCount={conversations.length}
        />

        {state.activeTab === 'properties' && (
          <AdminPropertiesTab
            properties={properties}
            propertiesLoading={propertiesLoading}
            showMap={state.showMap}
            setShowMap={state.setShowMap}
            onAddProperty={() => {
              state.setEditingProperty(null);
              state.setIsFormOpen(true);
            }}
            onEditProperty={handleEdit}
            onDeleteProperty={handleDelete}
          />
        )}

        {state.activeTab === 'requests' && (
          <AdminRequestsTab
            propertyRequests={propertyRequests}
            requestsLoading={requestsLoading}
            replyingToRequest={state.replyingToRequest}
            replyMessage={state.replyMessage}
            setReplyingToRequest={state.setReplyingToRequest}
            setReplyMessage={state.setReplyMessage}
            sendReplyMutation={mutations.sendReplyMutation}
            onApproveRequest={handlers.handleApproveRequest}
            onRejectRequest={handlers.handleRejectRequest}
            onSendReply={handlers.handleSendReply}
          />
        )}

        {state.activeTab === 'content' && (
          <AdminContentTab
            blogPosts={blogPosts}
            newsArticles={newsArticles}
            blogLoading={blogLoading}
            newsLoading={newsLoading}
            onCreateBlogPost={() => state.setIsBlogFormOpen(true)}
            onCreateNewsArticle={() => state.setIsNewsFormOpen(true)}
          />
        )}

        {state.activeTab === 'chats' && (
          <AdminChatsTab />
        )}
      </div>

      {/* Modals */}
      {state.isFormOpen && (
        <PropertyForm
          property={state.editingProperty}
          onClose={() => {
            state.setIsFormOpen(false);
            state.setEditingProperty(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
            state.setIsFormOpen(false);
            state.setEditingProperty(null);
          }}
        />
      )}

      {state.isApprovalFormOpen && state.approvingRequest && (
        <PropertyRequestApprovalForm
          request={state.approvingRequest}
          onClose={() => {
            state.setIsApprovalFormOpen(false);
            state.setApprovingRequest(null);
          }}
          onApprove={handlers.handleApprovalSubmit}
        />
      )}

      {state.isBlogFormOpen && (
        <BlogPostForm
          onClose={() => state.setIsBlogFormOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
            state.setIsBlogFormOpen(false);
          }}
        />
      )}

      {state.isNewsFormOpen && (
        <NewsArticleForm
          onClose={() => state.setIsNewsFormOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-news-articles'] });
            state.setIsNewsFormOpen(false);
          }}
        />
      )}

      <Footer />
    </div>
  );
};

export default AdminDashboard;
