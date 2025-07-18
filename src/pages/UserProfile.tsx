
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, CheckCircle, XCircle, Trash2, User, Heart, MessageSquare, Settings } from 'lucide-react';
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
import { PropertyRequest } from '@/types/propertyRequest';
import { Property } from '@/types/property';
import PropertyCard from '@/components/PropertyCard';
import FavoritesList from '@/components/FavoritesList';
import { ChatInterface } from '@/components/chat/ChatInterface';

const UserProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const { data: userRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['user-property-requests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('property_requests')
        .select('*, qr_code')
        .eq('user_id', user.id)
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

  const requestDeletionMutation = useMutation({
    mutationFn: async (requestId: string) => {
      if (!user) throw new Error('User not authenticated');

      console.log('UserProfile: Creating deletion request for:', requestId);
      
      // Create a deletion request for admin approval
      const { error } = await supabase
        .from('property_requests')
        .update({ 
          status: 'deletion_requested',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .eq('user_id', user.id);

      if (error) {
        console.error('UserProfile: Error creating deletion request:', error);
        throw new Error(`Failed to request deletion: ${error.message}`);
      }

      console.log('UserProfile: Deletion request created successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-property-requests'] });
      
      toast({
        title: "Deletion requested",
        description: "Your deletion request has been sent to admin for approval.",
      });
    },
    onError: (error: any) => {
      console.error('UserProfile: Failed to request deletion:', error);
      toast({
        title: "Error requesting deletion",
        description: error.message || 'Failed to request deletion. Please try again.',
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

  const handleRequestDeletion = (requestId: string) => {
    if (window.confirm('Are you sure you want to request deletion of this listing? An admin will need to approve this request.')) {
      console.log('UserProfile: User confirmed deletion request for:', requestId);
      requestDeletionMutation.mutate(requestId);
    }
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
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={userProfile?.profile_picture} alt={userProfile?.full_name} />
              <AvatarFallback className="bg-primary text-white text-xl">
                {userProfile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {userProfile?.full_name || 'User'}
              </h1>
              <p className="text-gray-600 mb-2">{user.email}</p>
              {userProfile?.role && (
                <Badge variant="outline" className="capitalize">
                  {userProfile.role}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="text-center">
                <div className="font-semibold text-lg text-gray-900">{userRequests.length}</div>
                <div>Listings</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg text-gray-900">
                  {userRequests.filter(req => req.status === 'approved').length}
                </div>
                <div>Approved</div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="listings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>My Listings</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>Favorites</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Messages</span>
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
                {requestsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your listings...</p>
                  </div>
                ) : userRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium mb-2">No property listings yet</p>
                    <p className="text-gray-400 mb-4">Start by creating your first property listing!</p>
                    <Button 
                      onClick={() => window.location.href = '/list-property'}
                      className="bg-primary hover:bg-blue-700"
                    >
                      List a Property
                    </Button>
                  </div>
                ) : (
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
                            {request.status !== 'deletion_requested' && (
                              <Button
                                onClick={() => handleRequestDeletion(request.id)}
                                variant="outline"
                                size="sm"
                                className="bg-white/90 hover:bg-red-50 hover:border-red-200"
                                disabled={requestDeletionMutation.isPending}
                              >
                                {requestDeletionMutation.isPending ? (
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
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            <FavoritesList />
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <ChatInterface />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default UserProfile;
