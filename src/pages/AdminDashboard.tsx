
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
import AdminContactTab from '@/components/admin/AdminContactTab';
import { useAdminQueries } from '@/hooks/useAdminQueries';
import { useAdminMutations } from '@/hooks/useAdminMutations';
import { useAdminHandlers } from '@/hooks/useAdminHandlers';
import { useAdminState } from '@/hooks/useAdminState';
import { Property } from '@/types/property';

// Define the AdminProperty interface to match AdminPropertiesTab expectations
interface AdminProperty {
  id: number;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  type: 'rent' | 'sale';
  is_hot_deal: boolean;
  description: string;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
  amenities: string[] | null;
  images: string[] | null;
}

const AdminDashboard = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const state = useAdminState();

  const {
    properties: rawProperties,
    propertiesLoading,
    propertyRequests,
    requestsLoading,
    contactInquiries,
    contactInquiriesLoading,
    blogPosts,
    blogLoading,
    newsArticles,
    newsLoading,
    conversations,
    messages,
    selectedUserRequests,
  } = useAdminQueries(state.selectedConversation, state.selectedChatUserId);

  // Transform properties to match AdminPropertiesTab expectations (with number IDs)
  const transformedProperties: AdminProperty[] = rawProperties.map(property => ({
    id: parseInt(property.id) || 0,
    title: property.title || 'Untitled Property',
    price: property.price || 0,
    location: property.location || 'Unknown Location',
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    type: (property.type === 'rent' || property.type === 'sale') ? property.type : 'rent' as 'rent' | 'sale',
    is_hot_deal: property.isHotDeal || false,
    description: property.description || '',
    created_at: property.created_at || new Date().toISOString(),
    latitude: property.coordinates?.lat || null,
    longitude: property.coordinates?.lng || null,
    amenities: property.amenities || [],
    images: property.images || []
  }));

  const mutations = useAdminMutations(profile, propertyRequests);

  const handlers = useAdminHandlers(
    queryClient,
    mutations.sendReplyMutation,
    mutations.sendChatMessageMutation,
    mutations.deleteMutation,
    state
  );

  const handleEdit = (property: AdminProperty) => {
    const propertyForEdit: Property = {
      id: String(property.id),
      title: property.title,
      price: property.price,
      location: property.location,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: 1000,
      image: property.images && property.images.length > 0 ? property.images[0] : '/placeholder.svg',
      images: property.images || ['/placeholder.svg'],
      type: property.type,
      isHotDeal: property.is_hot_deal,
      description: property.description,
      amenities: property.amenities || [],
      coordinates: {
        lat: property.latitude || 0,
        lng: property.longitude || 0
      },
      propertyType: 'Apartment',
      yearBuilt: undefined,
      parking: undefined,
      owner_id: undefined,
      is_approved: true,
      created_at: property.created_at
    };
    handlers.handleEdit(propertyForEdit);
  };

  const handleDelete = async (id: number) => {
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
          propertiesCount={transformedProperties.length}
          pendingRequestsCount={propertyRequests.filter(r => r.status === 'pending').length}
          openChatsCount={conversations.length}
          contactInquiriesCount={contactInquiries.filter(inquiry => inquiry.status === 'new').length}
        />

        {state.activeTab === 'properties' && (
          <AdminPropertiesTab
            properties={transformedProperties}
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
            onReviewRequest={handlers.handleReviewRequest}
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

        {state.activeTab === 'contact' && (
          <AdminContactTab />
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
