import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Eye, Map, CheckCircle, XCircle, Clock, FileText, Newspaper } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import PropertyForm from '@/components/PropertyForm';
import PropertyRequestApprovalForm from '@/components/PropertyRequestApprovalForm';
import BlogPostForm from '@/components/BlogPostForm';
import NewsArticleForm from '@/components/NewsArticleForm';
import ExpandablePropertyCard from '@/components/ExpandablePropertyCard';
import MapboxTokenSettings from '@/components/MapboxTokenSettings';
import PropertyMap from '@/components/PropertyMap';
import { PropertyRequest } from '@/types/propertyRequest';

interface Property {
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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBlogFormOpen, setIsBlogFormOpen] = useState(false);
  const [isNewsFormOpen, setIsNewsFormOpen] = useState(false);
  const [isApprovalFormOpen, setIsApprovalFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [approvingRequest, setApprovingRequest] = useState<PropertyRequest | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [activeTab, setActiveTab] = useState<'properties' | 'requests' | 'content'>('properties');
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Property[];
    },
  });

  const { data: propertyRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['property-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PropertyRequest[];
    },
  });

  const { data: blogPosts = [], isLoading: blogLoading } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: newsArticles = [], isLoading: newsLoading } = useQuery({
    queryKey: ['admin-news-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_news_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast({
        title: "Property deleted",
        description: "The property has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete property. Please try again.",
        variant: "destructive",
      });
    },
  });

  const approveRequestWithDetailsMutation = useMutation({
    mutationFn: async ({ requestId, updatedData }: { requestId: string, updatedData: any }) => {
      // First, insert the property with the updated data
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .insert([updatedData])
        .select()
        .single();

      if (propertyError) throw propertyError;

      // Then update the request status
      const { error: requestError } = await supabase
        .from('property_requests')
        .update({ 
          status: 'approved', 
          approved_by: (await supabase.auth.getUser()).data.user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (requestError) throw requestError;

      return propertyData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      setIsApprovalFormOpen(false);
      setApprovingRequest(null);
      toast({
        title: "Request Approved",
        description: "The property request has been approved and added to listings.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to approve request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('property_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-requests'] });
      toast({
        title: "Request Rejected",
        description: "The property request has been rejected.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to reject request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleApproveRequest = (request: PropertyRequest) => {
    setApprovingRequest(request);
    setIsApprovalFormOpen(true);
  };

  const handleApprovalSubmit = (requestId: string, updatedData: any) => {
    approveRequestWithDetailsMutation.mutate({ requestId, updatedData });
  };

  const handleRejectRequest = (requestId: string) => {
    if (window.confirm('Are you sure you want to reject this property request?')) {
      rejectRequestMutation.mutate(requestId);
    }
  };

  const formatPrice = (price: number, type: string) => {
    if (type === 'rent') {
      return `AED ${price.toLocaleString()}/month`;
    }
    return `AED ${price.toLocaleString()}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</span>;
      case 'approved':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</span>;
      default:
        return null;
    }
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
          <p className="text-gray-600">Manage properties, requests, and content</p>
        </div>

        <MapboxTokenSettings />

        {/* Tab Navigation */}
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
                Published Properties ({properties.length})
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'requests'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Property Requests ({propertyRequests.filter(r => r.status === 'pending').length} pending)
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
            </nav>
          </div>
        </div>

        {activeTab === 'properties' && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <Button
                onClick={() => {
                  setEditingProperty(null);
                  setIsFormOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New Property
              </Button>

              <Button
                onClick={() => setShowMap(!showMap)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Map className="h-4 w-4" />
                {showMap ? 'Hide Map' : 'Show Map'}
              </Button>
            </div>

            {showMap && (
              <div className="mb-6">
                <PropertyMap
                  properties={properties.map(p => ({
                    id: p.id,
                    title: p.title,
                    location: p.location,
                    price: p.price,
                    type: p.type,
                    latitude: p.latitude,
                    longitude: p.longitude,
                  }))}
                  height="500px"
                />
              </div>
            )}

            {propertiesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading properties...</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {properties.map((property) => (
                  <ExpandablePropertyCard
                    key={property.id}
                    property={property}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    showActions={true}
                  />
                ))}

                {properties.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No properties found. Add your first property!</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'requests' && (
          <>
            {requestsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading property requests...</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {propertyRequests.map((request) => (
                  <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                        <p className="text-gray-600">{request.location}</p>
                        <p className="text-primary font-bold">{formatPrice(request.price, request.type)}</p>
                        <div className="mt-2">
                          {getStatusBadge(request.status)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          Submitted: {new Date(request.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Contact: {request.contact_name} ({request.contact_email})
                        </p>
                      </div>
                    </div>
                    
                    {request.description && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                        <p className="text-gray-700 text-sm">{request.description}</p>
                      </div>
                    )}

                    {request.status === 'pending' && (
                      <div className="flex items-center gap-2 pt-4 border-t">
                        <Button
                          onClick={() => handleApproveRequest(request)}
                          className="text-green-600 hover:text-green-800"
                          variant="outline"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve & Edit
                        </Button>
                        <Button
                          onClick={() => handleRejectRequest(request.id)}
                          className="text-red-600 hover:text-red-800"
                          variant="outline"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                {propertyRequests.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No property requests found.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'content' && (
          <>
            <div className="mb-6 flex items-center gap-4">
              <Button
                onClick={() => setIsBlogFormOpen(true)}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Create Blog Post
              </Button>
              <Button
                onClick={() => setIsNewsFormOpen(true)}
                className="flex items-center gap-2"
              >
                <Newspaper className="h-4 w-4" />
                Create News Article
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Blog Posts ({blogPosts.length})</h3>
                {blogLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {blogPosts.map((post: any) => (
                      <div key={post.id} className="bg-white p-4 rounded-lg shadow border">
                        <h4 className="font-medium text-gray-900">{post.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{post.excerpt || 'No excerpt'}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            post.status === 'published' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {post.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    {blogPosts.length === 0 && (
                      <p className="text-gray-500 text-sm">No blog posts created yet.</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">News Articles ({newsArticles.length})</h3>
                {newsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {newsArticles.map((article: any) => (
                      <div key={article.id} className="bg-white p-4 rounded-lg shadow border">
                        <h4 className="font-medium text-gray-900">{article.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{article.excerpt || 'No excerpt'}</p>
                        {article.source && (
                          <p className="text-xs text-gray-500 mt-1">Source: {article.source}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            article.status === 'published' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {article.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(article.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    {newsArticles.length === 0 && (
                      <p className="text-gray-500 text-sm">No news articles created yet.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
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
