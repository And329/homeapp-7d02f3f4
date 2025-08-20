
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, CheckCircle, XCircle, Trash2, User, Heart, MessageSquare, Settings, Plus, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { PropertyRequest } from '@/types/propertyRequest';
import { Property } from '@/types/property';
import PropertyCard from '@/components/PropertyCard';
import FavoritesList from '@/components/FavoritesList';
import ExpandablePropertyCard from '@/components/ExpandablePropertyCard';
import UnifiedChat from '@/components/UnifiedChat';
import ContactAdminButton from '@/components/ContactAdminButton';
import { DeletionReasonDialog } from '@/components/DeletionReasonDialog';
import { usePropertyDeletion } from '@/hooks/usePropertyDeletion';

const UserProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showChatUserId, setShowChatUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletionDialog, setDeletionDialog] = useState<{
    isOpen: boolean;
    requestId: string;
    title: string;
  }>({
    isOpen: false,
    requestId: '',
    title: '',
  });

  const { requestDeletion, isRequestingDeletion } = usePropertyDeletion();

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch user's approved properties (where admin changes are reflected)
  const { data: userApprovedProperties = [], isLoading: approvedPropertiesLoading } = useQuery({
    queryKey: ['user-approved-properties', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user approved properties:', error);
        throw error;
      }

      return (data || []).map(property => {
        const type = (property.type === 'rent' || property.type === 'sale') ? property.type : 'rent';
        
        return {
          ...property,
          type: type as 'rent' | 'sale',
          images: Array.isArray(property.images) ? property.images.filter((img): img is string => typeof img === 'string') : ['/placeholder.svg'],
          videos: Array.isArray(property.videos) ? property.videos.filter((video): video is string => typeof video === 'string') : [],
          amenities: Array.isArray(property.amenities) ? property.amenities.filter((amenity): amenity is string => typeof amenity === 'string') : [],
        } as Property;
      });
    },
    enabled: !!user,
  });

  // Fetch user's pending/rejected property requests
  const { data: userRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['user-property-requests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('property_requests')
        .select('*, qr_code')
        .eq('user_id', user.id)
        .neq('status', 'approved') // Don't show approved ones since they're in properties table
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user requests:', error);
        throw error;
      }

      return (data || []).map(request => {
        const type = (request.type === 'rent' || request.type === 'sale') ? request.type : 'rent';
        
        return {
          ...request,
          type: type as 'rent' | 'sale',
          images: Array.isArray(request.images) ? request.images.filter((img): img is string => typeof img === 'string') : [],
          videos: Array.isArray(request.videos) ? request.videos.filter((video): video is string => typeof video === 'string') : [],
          amenities: Array.isArray(request.amenities) ? request.amenities.filter((amenity): amenity is string => typeof amenity === 'string') : null,
          submitter_type: (request.submitter_type && ['owner', 'broker', 'referral'].includes(request.submitter_type)) 
            ? request.submitter_type as 'owner' | 'broker' | 'referral' 
            : 'owner' as 'owner' | 'broker' | 'referral',
          qr_code: request.qr_code || null
        } as PropertyRequest;
      });
    },
    enabled: !!user,
  });

  const { data: userProperties = [] } = useQuery({
    queryKey: ['user-properties', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('properties')
        .select('id, title')
        .eq('owner_id', user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Delete the old requestDeletionMutation since we're using the hook now

  // Chat with admin mutation
  const createConversationMutation = useMutation({
    mutationFn: async ({ propertyRequestId, propertyTitle }: { propertyRequestId: string | null; propertyTitle: string }) => {
      if (!user) throw new Error('User not authenticated');

      // Use the RPC function to create admin conversation
      const { data: conversationId, error } = await supabase.rpc('create_admin_conversation', {
        p_admin_id: 'b8f20b8b-d80d-4ff6-a19f-46ea6c9da714', // Use the admin ID from database
        p_user_id: user.id,
        p_property_request_id: propertyRequestId,
        p_subject: `Property Support: ${propertyTitle}`
      });

      if (error) {
        console.error('Error creating admin conversation:', error);
        throw error;
      }

      // Send initial message with property details
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: `Hi, I need help with my property listing: "${propertyTitle}"`
        });

      if (messageError) throw messageError;

      return { conversationId };
    },
    onSuccess: () => {
      toast({
        title: "Chat started",
        description: "Conversation with admin has been created with property details. Check the Messages tab.",
      });
      // Refresh conversations
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to start chat: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { icon: Clock, className: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      approved: { icon: CheckCircle, className: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { icon: XCircle, className: 'bg-red-100 text-red-800', label: 'Rejected' },
      deletion_requested: { icon: Trash2, className: 'bg-orange-100 text-orange-800', label: 'Deletion Requested' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const handleRequestDeletion = (requestId: string, title: string) => {
    console.log('UserProfile: handleRequestDeletion called with:', requestId, title);
    setDeletionDialog({
      isOpen: true,
      requestId,
      title,
    });
    console.log('UserProfile: Dialog state set to:', { isOpen: true, requestId, title });
  };

  const handleConfirmDeletion = async (reason: string) => {
    console.log('UserProfile: User confirmed deletion request for:', deletionDialog.requestId, 'with reason:', reason);
    try {
      const result = await requestDeletion({ 
        propertyRequestId: deletionDialog.requestId, 
        reason 
      });
      console.log('UserProfile: Deletion request completed successfully:', result);
      setDeletionDialog({ isOpen: false, requestId: '', title: '' });
    } catch (error) {
      console.error('UserProfile: Failed to request deletion:', error);
    }
  };

  const handleChatWithAdmin = (propertyRequestId: string, propertyTitle: string) => {
    createConversationMutation.mutate({ propertyRequestId, propertyTitle });
  };

  // Delete approved property mutation
  const deletePropertyMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)
        .eq('owner_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-approved-properties'] });
      toast({
        title: "Property deleted",
        description: "Your property has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting property",
        description: error.message || 'Failed to delete property. Please try again.',
        variant: "destructive",
      });
    },
  });

  const handleDeleteProperty = (propertyId: string) => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      deletePropertyMutation.mutate(propertyId);
    }
  };

  // Start chat for approved property (contact admin about property)
  const handleStartChatForProperty = (propertyId: string, propertyTitle: string) => {
    // For approved properties, we don't pass a property request ID since it's already approved
    createConversationMutation.mutate({ propertyRequestId: null, propertyTitle: `Support for: ${propertyTitle}` });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
            <p className="mt-2 text-gray-600">Please log in to view your profile.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
              <div className="text-center mb-6">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={userProfile?.profile_picture} />
                  <AvatarFallback className="text-2xl">
                    {userProfile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold text-gray-900">
                  {userProfile?.full_name || 'User'}
                </h2>
                <p className="text-gray-600 text-sm">{user?.email}</p>
                {userProfile?.role && (
                  <Badge variant="outline" className="capitalize mt-2">
                    {userProfile.role}
                  </Badge>
                )}
              </div>
              
              <div className="space-y-3 mb-6">
                <Button 
                  onClick={() => navigate('/messages')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </Button>
                
                <Button 
                  onClick={() => navigate('/list-property')}
                  className="w-full justify-start"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  List Property
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center text-sm border-t pt-4">
                <div>
                  <div className="font-semibold text-lg text-gray-900">{userApprovedProperties.length + userRequests.length}</div>
                  <div className="text-gray-600">Listings</div>
                </div>
                <div>
                  <div className="font-semibold text-lg text-gray-900">
                    {userApprovedProperties.length}
                  </div>
                  <div className="text-gray-600">Approved</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
              <p className="text-gray-600">Manage your properties and account settings</p>
            </div>

            <Tabs defaultValue="listings" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="listings" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>My Listings</span>
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex items-center space-x-2">
                  <Heart className="h-4 w-4" />
                  <span>Favorites</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="listings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="h-5 w-5" />
                      <span>Property Listings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(requestsLoading || approvedPropertiesLoading) ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading your listings...</p>
                      </div>
                    ) : (userApprovedProperties.length === 0 && userRequests.length === 0) ? (
                      <div className="text-center py-8">
                        <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg font-medium mb-2">No property listings yet</p>
                        <p className="text-gray-400 mb-4">Start by creating your first property listing!</p>
                        <Button 
                          onClick={() => navigate('/list-property')}
                          className="bg-primary hover:bg-blue-700"
                        >
                          List a Property
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Approved Properties */}
                        {userApprovedProperties.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center">
                              <CheckCircle className="w-5 h-5 mr-2" />
                              Live Properties
                            </h3>
                            <div className="space-y-4">
                              {userApprovedProperties.map((property) => (
                                <div key={property.id} className="relative">
                                  <PropertyCard 
                                    property={property} 
                                    onClick={() => navigate(`/properties/${property.id}`)}
                                  />
                                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                                    <Badge className="bg-green-100 text-green-800">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Live
                                    </Badge>
                                    <Button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStartChatForProperty(property.id, property.title || 'Property');
                                      }}
                                      variant="outline"
                                      size="sm"
                                      className="bg-white/90 hover:bg-blue-50 hover:border-blue-200"
                                      disabled={createConversationMutation.isPending}
                                    >
                                      {createConversationMutation.isPending ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                      ) : (
                                        <MessageCircle className="h-4 w-4 text-blue-600" />
                                      )}
                                    </Button>
                                    <Button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteProperty(property.id);
                                      }}
                                      variant="outline"
                                      size="sm"
                                      className="bg-white/90 hover:bg-red-50 hover:border-red-200"
                                      disabled={deletePropertyMutation.isPending}
                                    >
                                      {deletePropertyMutation.isPending ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                      ) : (
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Pending/Rejected Requests */}
                        {userRequests.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-orange-700 mb-4 flex items-center">
                              <Clock className="w-5 h-5 mr-2" />
                              Pending Requests
                            </h3>
                            <div className="space-y-4">
                              {userRequests.map((request) => {
                                const transformedProperty: Property = {
                                  id: request.id,
                                  title: request.title,
                                  price: request.price,
                                  location: request.location || '',
                                  emirate: request.emirate || '',
                                  latitude: request.latitude,
                                  longitude: request.longitude,
                                  bedrooms: request.bedrooms || 0,
                                  bathrooms: request.bathrooms || 0,
                                  area: request.area || null,
                                  property_type: request.property_type || 'Apartment',
                                  year_built: null,
                                  parking: null,
                                  type: request.type,
                                  description: request.description || '',
                                  is_hot_deal: false,
                                  amenities: Array.isArray(request.amenities) ? request.amenities : [],
                                  images: Array.isArray(request.images) ? request.images : ['/placeholder.svg'],
                                  qr_code: request.qr_code || '',
                                  owner_id: request.user_id,
                                  is_approved: request.status === 'approved',
                                  created_at: request.created_at,
                                };
                                
                                return (
                                  <div key={request.id} className="relative">
                                    <PropertyCard property={transformedProperty} />
                                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                                      {getStatusBadge(request.status)}
                                      <Button
                                        onClick={() => handleChatWithAdmin(request.id, request.title)}
                                        variant="outline"
                                        size="sm"
                                        className="bg-white/90 hover:bg-blue-50 hover:border-blue-200"
                                        disabled={createConversationMutation.isPending}
                                      >
                                        {createConversationMutation.isPending ? (
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                        ) : (
                                          <MessageSquare className="h-4 w-4 text-blue-600" />
                                        )}
                                      </Button>
                                      {request.status !== 'deletion_requested' && (
                                       <Button
                                         onClick={(e) => {
                                           e.stopPropagation();
                                           console.log('Bin icon clicked for request:', request.id, request.title);
                                           handleRequestDeletion(request.id, request.title);
                                         }}
                                         variant="outline"
                                         size="sm"
                                         className="bg-white/90 hover:bg-red-50 hover:border-red-200"
                                         disabled={isRequestingDeletion}
                                       >
                                          {isRequestingDeletion ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                          ) : (
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                          )}
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="favorites" className="space-y-6">
                <FavoritesList />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {showChatUserId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl h-[80vh]">
                <UnifiedChat 
                  onClose={() => setShowChatUserId(null)}
                />
              </div>
            </div>
          </div>
        )}

        <DeletionReasonDialog
          isOpen={deletionDialog.isOpen}
          onClose={() => {
            console.log('UserProfile: Closing deletion dialog');
            setDeletionDialog({ isOpen: false, requestId: '', title: '' });
          }}
          onConfirm={handleConfirmDeletion}
          isLoading={isRequestingDeletion}
          propertyTitle={deletionDialog.title}
        />
      </div>

      <Footer />
    </div>
  );
};

export default UserProfile;
