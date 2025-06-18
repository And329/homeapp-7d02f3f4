
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Eye, Map, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import PropertyForm from '@/components/PropertyForm';
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
}

const AdminDashboard = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [activeTab, setActiveTab] = useState<'properties' | 'requests'>('properties');
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

  const approveRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { data, error } = await supabase.rpc('approve_property_request', {
        request_id: requestId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
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

  const handleApproveRequest = (requestId: string) => {
    if (window.confirm('Are you sure you want to approve this property request?')) {
      approveRequestMutation.mutate(requestId);
    }
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
          <p className="text-gray-600">Manage properties and listing requests</p>
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
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Property
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bedrooms
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {properties.map((property) => (
                        <tr key={property.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {property.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {property.bathrooms} baths
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {property.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatPrice(property.price, property.type)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              property.type === 'rent' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              For {property.type === 'rent' ? 'Rent' : 'Sale'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {property.bedrooms}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {property.is_hot_deal && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                Hot Deal
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`/property/${property.id}`, '_blank')}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(property)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(property.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

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
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Property
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {propertyRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {request.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {request.bedrooms}BR • {request.bathrooms}BA
                              </div>
                              <div className="text-sm text-gray-500">
                                {request.location}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{request.contact_name}</div>
                            <div className="text-sm text-gray-500">{request.contact_email}</div>
                            {request.contact_phone && (
                              <div className="text-sm text-gray-500">{request.contact_phone}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatPrice(request.price, request.type)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              request.type === 'rent' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              For {request.type === 'rent' ? 'Rent' : 'Sale'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(request.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(request.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {request.status === 'pending' && (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApproveRequest(request.id)}
                                  className="text-green-600 hover:text-green-800"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRejectRequest(request.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {propertyRequests.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No property requests found.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

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

      <Footer />
    </div>
  );
};

export default AdminDashboard;
