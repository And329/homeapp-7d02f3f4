
import React from 'react';
import { CheckCircle, XCircle, Clock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PropertyRequest } from '@/types/propertyRequest';

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
}) => {
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

  const handleSendReply = (requestId: string) => {
    console.log('Sending reply for request:', requestId);
    console.log('Reply message:', replyMessage);
    if (!replyMessage.trim()) {
      console.log('Reply message is empty');
      return;
    }
    onSendReply(requestId);
  };

  const handleApproveRequest = (request: PropertyRequest) => {
    console.log('AdminRequestsTab: Approving request:', request.id);
    console.log('AdminRequestsTab: Original requester user_id:', request.user_id);
    onApproveRequest(request);
  };

  return (
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
                  {request.user_id && (
                    <p className="text-xs text-gray-400">
                      User ID: {request.user_id}
                    </p>
                  )}
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
                    Approve
                  </Button>
                  <Button
                    onClick={() => onRejectRequest(request.id)}
                    className="text-red-600 hover:text-red-800"
                    variant="outline"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => setReplyingToRequest(request.id)}
                    variant="outline"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Reply
                  </Button>
                </div>
              )}

              {request.status === 'rejected' && (
                <div className="pt-4 border-t">
                  <Button
                    onClick={() => setReplyingToRequest(request.id)}
                    variant="outline"
                    size="sm"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Add Reply
                  </Button>
                </div>
              )}

              {replyingToRequest === request.id && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Send Reply to User</h4>
                  <Textarea
                    placeholder="Type your reply here..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button
                      onClick={() => handleSendReply(request.id)}
                      disabled={!replyMessage.trim() || sendReplyMutation.isPending}
                      size="sm"
                    >
                      {sendReplyMutation.isPending ? 'Sending...' : 'Send Reply'}
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
  );
};

export default AdminRequestsTab;
