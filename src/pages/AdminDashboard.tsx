
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
import { Property } from '@/types/property';

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

  // Transform properties to match AdminPropertiesTab expectations
  const properties = rawProperties.map(property => ({
    ...property,
    is_hot_deal: property.isHotDeal || false,
    latitude: property.coordinates?.lat || null,
    longitude: property.coordinates?.lng || null,
    area: property.area || 1000,
    image: property.images && property.images.length > 0 ? property.images[0] : '/placeholder.svg',
    propertyType: property.propertyType || 'Apartment'
  }));

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
    // Convert back to Property type for editing
    const propertyForEdit: Property = {
      id: property.id,
      title: property.title,
      price: property.price,
      location: property.location,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      image: property.image,
      images: property.images,
      type: property.type,
      isHotDeal: property.is_hot_deal,
      description: property.description,
      amenities: property.amenities,
      coordinates: {
        lat: property.latitude || 0,
        lng: property.longitude || 0
      },
      propertyType: property.propertyType,
      yearBuilt: property.yearBuilt,
      parking: property.parking,
      owner_id: property.owner_id,
      is_approved: property.is_approved,
      created_at: property.created_at
    };
    handlers.handleEdit(propertyForEdit);
  };

  const handleDelete = async (id: any) => {
    await handlers.handleDelete(String(id));
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
