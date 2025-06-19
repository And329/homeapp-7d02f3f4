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
import PropertyCard from '@/components/PropertyCard';
import UnifiedChat from '@/components/UnifiedChat';
import FavoritesList from '@/components/FavoritesList';

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
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(request => {
        const type = (request.type === 'rent' || request.type === 'sale') ? request.type : 'rent';
        
        return {
          ...request,
          type: type as 'rent' | 'sale',
          images: Array.isArray(request.images) ? request.images.filter((img): img is string => typeof img === 'string') : [],
          videos: Array.isArray(request.videos) ? request.videos.filter((video): video is string => typeof video === 'string') : [],
          amenities: Array.isArray(request.amenities) ? request.amenities.filter((amenity): amenity is string => typeof amenity === 'string') : null,
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

  const deletePropertyRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Deleting property request:', requestId);

      const { data: request, error: requestError } = await supabase
        .from('property_requests')
        .select('status, title')
        .eq('id', requestId)
        .eq('user_id', user.id)
        .single();

      if (requestError) {
        console.error('Error fetching request:', requestError);
        throw requestError;
      }

      if (request && request.status === 'approved') {
        console.log('Request was approved, deleting associated property...');
        
        const matchingProperty = userProperties.find(prop => prop.title === request.title);
        
        if (matchingProperty) {
          const { error: propertyDeleteError } = await supabase
            .from('properties')
            .delete()
            .eq('id', matchingProperty.id)
            .eq('owner_id', user.id);

          if (propertyDeleteError) {
            console.error('Error deleting associated property:', propertyDeleteError);
          } else {
            console.log('Associated property deleted successfully');
          }
        }
      }

      const { error: deleteError } = await supabase
        .from('property_requests')
        .delete()
        .eq('id', requestId)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Error deleting request:', deleteError);
        throw deleteError;
      }

      console.log('Property request deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-property-requests'] });
      queryClient.invalidateQueries({ queryKey: ['user-properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast({
        title: "Listing deleted",
        description: "Your property listing has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Delete mutation error:', error);
      toast({
        title: "Error",
        description: `Failed to delete listing: ${error.message || 'Please try again.'}`,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { icon: Clock, className: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      approved: { icon: CheckCircle, className: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { icon: XCircle, className: 'bg-red-100 text-red-800', label: 'Rejected' }
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

  const handleDeleteListing = (requestId: string) => {
    if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      console.log('User confirmed deletion of request:', requestId);
      deletePropertyRequestMutation.mutate(requestId);
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
                      const transformedProperty = {
                        id: request.id,
                        title: request.title,
                        price: request.price,
                        location: request.location,
                        bedrooms: request.bedrooms,
                        bathrooms: request.bathrooms,
                        area: 1000,
                        image: Array.isArray(request.images) && request.images.length > 0 
                          ? request.images[0] 
                          : '/placeholder.svg',
                        images: Array.isArray(request.images) ? request.images : ['/placeholder.svg'],
                        type: request.type,
                        isHotDeal: false,
                        description: request.description,
                        amenities: Array.isArray(request.amenities) ? request.amenities : [],
                        coordinates: {
                          lat: request.latitude || 0,
                          lng: request.longitude || 0
                        },
                        propertyType: request.property_type || 'Apartment',
                        owner_id: request.user_id
                      };
                      
                      return (
                        <div key={request.id} className="relative">
                          <PropertyCard property={transformedProperty} />
                          <div className="absolute top-4 right-4 z-10 flex gap-2">
                            {getStatusBadge(request.status)}
                            <Button
                              onClick={() => handleDeleteListing(request.id)}
                              variant="outline"
                              size="sm"
                              className="bg-white/90 hover:bg-red-50 hover:border-red-200"
                              disabled={deletePropertyRequestMutation.isPending}
                            >
                              {deletePropertyRequestMutation.isPending ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                              ) : (
                                <Trash2 className="h-4 w-4 text-red-600" />
                              )}
                            </Button>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Messages</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UnifiedChat className="h-[600px]" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default UserProfile;
