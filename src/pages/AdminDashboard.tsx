
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Eye, Map } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import PropertyForm from '@/components/PropertyForm';
import MapboxTokenSettings from '@/components/MapboxTokenSettings';
import PropertyMap from '@/components/PropertyMap';

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
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties = [], isLoading } = useQuery({
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

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatPrice = (price: number, type: string) => {
    if (type === 'rent') {
      return `AED ${price.toLocaleString()}/month`;
    }
    return `AED ${price.toLocaleString()}`;
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
          <p className="text-gray-600">Manage your property listings</p>
        </div>

        <MapboxTokenSettings />

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

        {isLoading ? (
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
