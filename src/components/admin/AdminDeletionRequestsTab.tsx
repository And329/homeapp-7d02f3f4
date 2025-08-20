import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, CheckCircle, XCircle, Trash2, User, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DeletionRequestWithProperty } from '@/types/deletionRequest';
import { usePropertyDeletion } from '@/hooks/usePropertyDeletion';

interface AdminDeletionRequestsTabProps {
  onApproveDeletion?: (deletionRequest: DeletionRequestWithProperty) => void;
}

export const AdminDeletionRequestsTab: React.FC<AdminDeletionRequestsTabProps> = ({
  onApproveDeletion
}) => {
  console.log('AdminDeletionRequestsTab: Component rendered');
  const [searchQuery, setSearchQuery] = useState('');
  const { approveDeletion, isApprovingDeletion } = usePropertyDeletion();

  // Fetch deletion requests
  const { data: deletionRequests = [], isLoading: deletionRequestsLoading, error: queryError } = useQuery({
    queryKey: ['deletion-requests'],
    queryFn: async () => {
      console.log('AdminDeletionRequestsTab: Fetching deletion requests');
      
      const { data, error } = await supabase
        .from('property_deletion_requests')
        .select(`
          *,
          property_requests!left (
            id,
            title, 
            description,
            price,
            location,
            type,
            property_type,
            contact_name,
            contact_email, 
            contact_phone,
            emirate,
            bedrooms,
            bathrooms,
            area,
            images,
            user_id,
            created_at
          ),
          properties!left (
            id,
            title,
            description, 
            price,
            location,
            type,
            property_type,
            contact_name,
            contact_email,
            contact_phone,
            emirate,
            bedrooms,
            bathrooms,
            area,
            images,
            owner_id,
            created_at
          ),
          profiles!property_deletion_requests_user_id_fkey (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('AdminDeletionRequestsTab: Error fetching deletion requests:', error);
        throw error;
      }

      console.log('AdminDeletionRequestsTab: Fetched deletion requests:', data);
      console.log('AdminDeletionRequestsTab: Data length:', data?.length || 0);
      return data as any[];
    },
  });

  // Log query error if any
  if (queryError) {
    console.error('AdminDeletionRequestsTab: Query error:', queryError);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock };
      case 'approved':
        return { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle };
      case 'rejected':
        return { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock };
    }
  };

  const handleApproveDeletion = async (deletionRequest: DeletionRequestWithProperty) => {
    try {
      await approveDeletion(deletionRequest.id);
      if (onApproveDeletion) {
        onApproveDeletion(deletionRequest);
      }
    } catch (error) {
      console.error('Failed to approve deletion:', error);
    }
  };

  // Filter deletion requests based on search query
  const filteredRequests = deletionRequests.filter(request => {
    const property = request.property_requests || request.properties;
    const searchLower = searchQuery.toLowerCase();
    
    return (
      property?.title?.toLowerCase().includes(searchLower) ||
      property?.contact_name?.toLowerCase().includes(searchLower) ||
      property?.contact_email?.toLowerCase().includes(searchLower) ||
      property?.location?.toLowerCase().includes(searchLower) ||
      request.reason?.toLowerCase().includes(searchLower)
    );
  });

  if (deletionRequestsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Deletion Requests</h3>
          <p className="text-sm text-gray-600">
            Manage property deletion requests from users
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {filteredRequests.length} requests
        </Badge>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by title, contact, location, or reason..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Deletion Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchQuery ? 'No deletion requests match your search' : 'No deletion requests found'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((deletionRequest) => {
            const property = deletionRequest.property_requests || deletionRequest.properties;
            const isLiveProperty = !!deletionRequest.properties;
            const statusInfo = getStatusColor(deletionRequest.status);
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={deletionRequest.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">
                      {property?.title || 'Unknown Property'}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {isLiveProperty && (
                        <Badge variant="outline" className="text-xs">
                          Live Property
                        </Badge>
                      )}
                      <Badge 
                        className={`${statusInfo.bg} ${statusInfo.text} border-0`}
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {deletionRequest.status.charAt(0).toUpperCase() + deletionRequest.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Property Details */}
                  {property && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Price:</span> AED {property.price?.toLocaleString() || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Type:</span> {property.type || 'N/A'} · {property.property_type || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Location:</span> {property.location || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Beds/Baths:</span> {property.bedrooms || 0}/{property.bathrooms || 0}
                      </div>
                    </div>
                  )}

                  {/* Contact Information */}
                  {property && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center mb-2">
                        <User className="h-4 w-4 mr-2 text-gray-600" />
                        <span className="font-medium text-sm">Contact Information</span>
                      </div>
                      <div className="text-sm space-y-1">
                        <p><strong>Name:</strong> {property.contact_name || 'N/A'}</p>
                        <p><strong>Email:</strong> {property.contact_email || 'N/A'}</p>
                        {property.contact_phone && <p><strong>Phone:</strong> {property.contact_phone}</p>}
                      </div>
                    </div>
                  )}

                  {/* User Information */}
                  {deletionRequest.profiles && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center mb-2">
                        <User className="h-4 w-4 mr-2 text-blue-600" />
                        <span className="font-medium text-sm">Requested By</span>
                      </div>
                      <div className="text-sm space-y-1">
                        <p><strong>Name:</strong> {deletionRequest.profiles.full_name || 'N/A'}</p>
                        <p><strong>Email:</strong> {deletionRequest.profiles.email || 'N/A'}</p>
                      </div>
                    </div>
                  )}

                  {/* Deletion Reason */}
                  {deletionRequest.reason && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-orange-800 mb-1">Deletion Reason:</p>
                      <p className="text-sm text-orange-700">{deletionRequest.reason}</p>
                    </div>
                  )}

                  {/* Request Details */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Requested: {new Date(deletionRequest.created_at).toLocaleString()}</p>
                    {deletionRequest.approved_at && (
                      <p>Processed: {new Date(deletionRequest.approved_at).toLocaleString()}</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {deletionRequest.status === 'pending' && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button
                        onClick={() => handleApproveDeletion(deletionRequest)}
                        variant="destructive"
                        size="sm"
                        disabled={isApprovingDeletion}
                      >
                        {isApprovingDeletion ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        Approve Deletion
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};