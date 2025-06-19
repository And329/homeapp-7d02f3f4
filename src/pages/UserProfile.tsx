
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PropertyRequest } from '@/types/propertyRequest';
import PropertyCard from '@/components/PropertyCard';
import UnifiedChat from '@/components/UnifiedChat';

const UserProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's property requests
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

  // Delete property request mutation
  const deletePropertyRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Deleting property request:', requestId);

      // First, get the request details to check if it was approved
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

      // If the request was approved, delete the associated property first
      if (request && request.status === 'approved') {
        console.log('Request was approved, deleting associated property...');
        
        // Find and delete properties that match this user and title
        const { error: propertyDeleteError } = await supabase
          .from('properties')
          .delete()
          .eq('owner_id', user.id)
          .eq('title', request.title);

        if (propertyDeleteError) {
          console.error('Error deleting associated property:', propertyDeleteError);
          // Don't throw here - we still want to delete the request
        }
      }

      // Delete the property request
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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your property listings and conversations</p>
        </div>

        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Listings</CardTitle>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your listings...</p>
                  </div>
                ) : userRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">You haven't submitted any property listings yet.</p>
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
                        propertyType: request.property_type || 'Apartment'
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

          <TabsContent value="messages" className="space-y-6">
            <UnifiedChat className="h-[600px]" />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default UserProfile;
