
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { PropertyRequest } from '@/types/propertyRequest';
import { Eye, CheckCircle, XCircle, MessageSquare, Trash2, Search } from 'lucide-react';

interface AdminRequestsTabProps {
  propertyRequests: PropertyRequest[];
  requestsLoading: boolean;
  replyingToRequest: string | null;
  replyMessage: string;
  setReplyingToRequest: (id: string | null) => void;
  setReplyMessage: (message: string) => void;
  sendReplyMutation: any;
  onApproveRequest: (request: PropertyRequest) => void;
  onRejectRequest: (requestId: string) => void;
  onSendReply: (requestId: string) => void;
  onReviewRequest: (request: PropertyRequest) => void;
  onApproveDeletion?: (request: PropertyRequest) => void;
}

const AdminRequestsTab: React.FC<AdminRequestsTabProps> = ({
  propertyRequests,
  requestsLoading,
  replyingToRequest,
  replyMessage,
  setReplyingToRequest,
  setReplyMessage,
  sendReplyMutation,
  onApproveRequest,
  onRejectRequest,
  onSendReply,
  onReviewRequest,
  onApproveDeletion,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'deletion_requested': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubmitterTypeLabel = (type: string) => {
    switch (type) {
      case 'owner': return 'Property Owner';
      case 'broker': return 'Real Estate Broker';
      case 'referral': return 'Referral Agent';
      default: return 'Owner';
    }
  };

  if (requestsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-gray-600">Loading requests...</span>
      </div>
    );
  }

  // Filter property requests based on search term
  const filteredRequests = propertyRequests.filter(request =>
    request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.contact_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (propertyRequests.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No property requests found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search requests by title, location, contact, status, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredRequests.length === 0 && propertyRequests.length > 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No requests match your search.</p>
          </CardContent>
        </Card>
      ) : (
        filteredRequests.map((request) => (
        <Card key={request.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{request.title}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Submitted by: {request.contact_name} ({request.contact_email})
                </p>
                <p className="text-sm text-gray-500">
                  Submitter: {getSubmitterTypeLabel(request.submitter_type || 'owner')}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
              <Badge className={getStatusColor(request.status)}>
                {request.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p><strong>Price:</strong> AED {request.price?.toLocaleString()}</p>
                <p><strong>Location:</strong> {request.location}</p>
                <p><strong>Type:</strong> {request.type}</p>
                <p><strong>Property Type:</strong> {request.property_type}</p>
                {request.area && <p><strong>Area:</strong> {request.area} sq ft</p>}
              </div>
              <div>
                <p><strong>Bedrooms:</strong> {request.bedrooms}</p>
                <p><strong>Bathrooms:</strong> {request.bathrooms}</p>
                <p><strong>Contact Name:</strong> {request.contact_name}</p>
                <p><strong>Contact Email:</strong> {request.contact_email}</p>
                {request.contact_phone && <p><strong>Contact Phone:</strong> {request.contact_phone}</p>}
              </div>
            </div>
            
            {request.description && (
              <div className="mb-4">
                <p><strong>Description:</strong></p>
                <p className="text-gray-700 mt-1">{request.description}</p>
              </div>
            )}

            {/* Display Images */}
            {request.images && request.images.length > 0 && (
              <div className="mb-4">
                <p className="font-medium mb-2">Images:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {request.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Property ${index + 1}`}
                      className="w-full h-20 object-cover rounded border"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Display Videos */}
            {request.videos && request.videos.length > 0 && (
              <div className="mb-4">
                <p className="font-medium mb-2">Videos:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {request.videos.map((video, index) => (
                    <video
                      key={index}
                      src={video}
                      controls
                      className="w-full h-32 rounded border"
                    />
                  ))}
                </div>
              </div>
            )}

            {request.status === 'deletion_requested' && onApproveDeletion && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <Trash2 className="h-5 w-5 text-orange-600" />
                <span className="text-orange-800 font-medium">Deletion requested for this property</span>
                <Button
                  onClick={() => onApproveDeletion(request)}
                  variant="destructive"
                  size="sm"
                  className="ml-auto"
                >
                  Approve Deletion
                </Button>
              </div>
            )}

            <div className="flex items-center gap-2 pt-4 border-t">
              {request.status === 'pending' && (
                <>
                  <Button
                    onClick={() => onReviewRequest(request)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    Review & Approve
                  </Button>
                  <Button
                    onClick={() => onRejectRequest(request.id)}
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </>
              )}
              
              <Button
                onClick={() => setReplyingToRequest(
                  replyingToRequest === request.id ? null : request.id
                )}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <MessageSquare className="h-4 w-4" />
                {replyingToRequest === request.id ? 'Cancel Reply' : 'Send Message'}
              </Button>
            </div>

            {replyingToRequest === request.id && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium mb-2">Send message to {request.contact_name}</h4>
                <Textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="mb-3"
                  rows={3}
                />
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => onSendReply(request.id)}
                    disabled={!replyMessage.trim() || sendReplyMutation.isPending}
                    size="sm"
                  >
                    {sendReplyMutation.isPending ? 'Sending...' : 'Send Message'}
                  </Button>
                  <Button
                    onClick={() => {
                      setReplyingToRequest(null);
                      setReplyMessage('');
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        ))
      )}
    </div>
  );
};

export default AdminRequestsTab;
