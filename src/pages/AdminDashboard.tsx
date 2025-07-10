
import React, { useState } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyForm from '@/components/PropertyForm';
import PropertyRequestApprovalForm from '@/components/PropertyRequestApprovalForm';
import BlogPostForm from '@/components/BlogPostForm';
import NewsArticleForm from '@/components/NewsArticleForm';
import TeamMemberForm from '@/components/TeamMemberForm';
import MapboxTokenSettings from '@/components/MapboxTokenSettings';
import AdminTabNavigation from '@/components/admin/AdminTabNavigation';
import AdminPropertiesTab from '@/components/admin/AdminPropertiesTab';
import AdminRequestsTab from '@/components/admin/AdminRequestsTab';
import AdminContentTab from '@/components/admin/AdminContentTab';
import AdminChatsTab from '@/components/admin/AdminChatsTab';
import AdminContactTab from '@/components/admin/AdminContactTab';
import AdminTeamTab from '@/components/admin/AdminTeamTab';
import { useAdminQueries } from '@/hooks/useAdminQueries';
import { useAdminMutations } from '@/hooks/useAdminMutations';
import { useAdminHandlers } from '@/hooks/useAdminHandlers';
import { useAdminState } from '@/hooks/useAdminState';
import { Property, DatabaseProperty } from '@/types/property';
import { TeamMember } from '@/types/teamMember';
import { supabase } from '@/integrations/supabase/client';

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
  
  // Team management states
  const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);

  // Fetch team members count
  const { data: teamMembersCount = 0 } = useQuery({
    queryKey: ['admin-team-members-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  const {
    properties: rawProperties,
    propertiesLoading,
    propertyRequests: rawPropertyRequests,
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

  // Transform database properties to AdminProperty format
  const transformedProperties: AdminProperty[] = rawProperties.map(property => ({
    id: parseInt(property.id),
    title: property.title || 'Untitled Property',
    price: property.price || 0,
    location: property.location || 'Unknown Location',
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    type: (property.type === 'rent' || property.type === 'sale') ? property.type : 'rent' as 'rent' | 'sale',
    is_hot_deal: property.is_hot_deal || false,
    description: property.description || '',
    created_at: property.created_at || new Date().toISOString(),
    latitude: property.latitude || null,
    longitude: property.longitude || null,
    amenities: Array.isArray(property.amenities) ? property.amenities as string[] : [],
    images: Array.isArray(property.images) ? property.images as string[] : []
  }));

  // Transform property requests to match expected types
  const propertyRequests = rawPropertyRequests.map(request => ({
    ...request,
    type: (request.type === 'rent' || request.type === 'sale') ? request.type : 'rent' as 'rent' | 'sale',
    amenities: Array.isArray(request.amenities) ? request.amenities as string[] : null,
    images: Array.isArray(request.images) ? request.images as string[] : null,
    status: (['pending', 'approved', 'rejected', 'deletion_requested'].includes(request.status)) 
      ? request.status as 'pending' | 'approved' | 'rejected' | 'deletion_requested'
      : 'pending' as 'pending' | 'approved' | 'rejected' | 'deletion_requested',
    submitter_type: (request.submitter_type && ['owner', 'broker', 'referral'].includes(request.submitter_type)) 
      ? request.submitter_type as 'owner' | 'broker' | 'referral' 
      : 'owner' as 'owner' | 'broker' | 'referral',
    qr_code: request.qr_code || null
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
    // Find the original database property to get all fields
    const originalProperty = rawProperties.find(p => p.id === property.id.toString());
    
    if (!originalProperty) {
      console.error('Original property not found for ID:', property.id);
      return;
    }

    // Create the property object with all the fields that PropertyForm expects
    const propertyForEdit: Property = {
      id: originalProperty.id,
      title: originalProperty.title || '',
      price: originalProperty.price || 0,
      location: originalProperty.location || '',
      emirate: originalProperty.emirate || '',
      latitude: originalProperty.latitude,
      longitude: originalProperty.longitude,
      bedrooms: originalProperty.bedrooms || 0,
      bathrooms: originalProperty.bathrooms || 0,
      area: originalProperty.area,
      property_type: originalProperty.property_type || 'Apartment',
      year_built: originalProperty.year_built,
      parking: originalProperty.parking,
      type: (originalProperty.type === 'rent' || originalProperty.type === 'sale') ? originalProperty.type : 'rent',
      description: originalProperty.description || '',
      is_hot_deal: originalProperty.is_hot_deal || false,
      amenities: Array.isArray(originalProperty.amenities) ? originalProperty.amenities as string[] : [],
      images: Array.isArray(originalProperty.images) ? originalProperty.images as string[] : [],
      videos: Array.isArray(originalProperty.videos) ? originalProperty.videos as string[] : [],
      qr_code: originalProperty.qr_code || '',
      owner_id: originalProperty.owner_id || undefined,
      is_approved: originalProperty.is_approved || false,
      created_at: originalProperty.created_at || undefined,
    };

    console.log('AdminDashboard: Setting property for edit:', propertyForEdit);
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
          teamMembersCount={teamMembersCount}
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
            onApproveDeletion={handlers.handleApproveDeletion}
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

        {state.activeTab === 'team' && (
          <AdminTeamTab 
            onCreateTeamMember={() => {
              setEditingTeamMember(null);
              setIsTeamFormOpen(true);
            }}
            onEditTeamMember={(member) => {
              setEditingTeamMember(member);
              setIsTeamFormOpen(true);
            }}
          />
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

      {isTeamFormOpen && (
        <TeamMemberForm
          member={editingTeamMember}
          onClose={() => {
            setIsTeamFormOpen(false);
            setEditingTeamMember(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-team-members'] });
            queryClient.invalidateQueries({ queryKey: ['admin-team-members-count'] });
            queryClient.invalidateQueries({ queryKey: ['team-members'] });
            setIsTeamFormOpen(false);
            setEditingTeamMember(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
};

export default AdminDashboard;
