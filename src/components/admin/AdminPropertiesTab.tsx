import React, { useState } from 'react';
import { Plus, Map, Edit, Trash2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import PropertyCard from '@/components/PropertyCard';
import PropertyMap from '@/components/PropertyMap';
import { Property } from '@/types/property';

interface AdminProperty {
  id: string;
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

interface AdminPropertiesTabProps {
  properties: AdminProperty[];
  propertiesLoading: boolean;
  showMap: boolean;
  setShowMap: (show: boolean) => void;
  onAddProperty: () => void;
  onEditProperty: (property: AdminProperty) => void;
  onDeleteProperty: (id: string) => void;
}

interface ContactEditDialogProps {
  propertyId: string;
  ownerId: string | null;
}

const ContactEditDialog: React.FC<ContactEditDialogProps> = ({ propertyId, ownerId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [contactData, setContactData] = useState({
    full_name: '',
    email: '',
    phone: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch owner profile data
  const { data: ownerProfile } = useQuery({
    queryKey: ['owner-profile', ownerId],
    queryFn: async () => {
      if (!ownerId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('id', ownerId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!ownerId && isOpen,
  });

  // Update contact mutation
  const updateContactMutation = useMutation({
    mutationFn: async (newContactData: { full_name: string; email: string; phone: string }) => {
      if (!ownerId) throw new Error('Owner ID not found');
      
      const { error } = await supabase
        .from('profiles')
        .update(newContactData)
        .eq('id', ownerId);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate all queries related to owner profiles to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['owner-profile'] });
      queryClient.invalidateQueries({ queryKey: ['owner-profile', ownerId] });
      setIsOpen(false);
      toast({
        title: "Contact updated",
        description: "Owner contact information has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update contact: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  React.useEffect(() => {
    if (ownerProfile && isOpen) {
      setContactData({
        full_name: ownerProfile.full_name || '',
        email: ownerProfile.email || '',
        phone: ownerProfile.phone || ''
      });
    }
  }, [ownerProfile, isOpen]);

  const handleSave = () => {
    updateContactMutation.mutate(contactData);
  };

  if (!ownerId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur-sm h-8 w-8 p-0">
          <User className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Contact Information</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={contactData.full_name}
              onChange={(e) => setContactData(prev => ({ ...prev, full_name: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={contactData.email}
              onChange={(e) => setContactData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={contactData.phone}
              onChange={(e) => setContactData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={updateContactMutation.isPending}
            >
              {updateContactMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AdminPropertiesTab: React.FC<AdminPropertiesTabProps> = ({
  properties,
  propertiesLoading,
  showMap,
  setShowMap,
  onAddProperty,
  onEditProperty,
  onDeleteProperty,
}) => {
  const navigate = useNavigate();
  // Get properties with owner IDs for contact editing
  const { data: propertiesWithOwners } = useQuery({
    queryKey: ['admin-properties-with-owners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, owner_id')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const getOwnerIdForProperty = (propertyId: string) => {
    const property = propertiesWithOwners?.find(p => p.id === propertyId);
    return property?.owner_id || null;
  };

  const handleCardClick = (propertyId: string) => {
    navigate(`/properties/${propertyId}`);
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <Button
          onClick={onAddProperty}
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
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => {
            const transformedProperty: Property = {
              id: property.id,
              title: property.title || 'Untitled Property',
              price: property.price || 0,
              location: property.location || 'Unknown Location',
              emirate: '',
              latitude: property.latitude,
              longitude: property.longitude,
              bedrooms: property.bedrooms || 0,
              bathrooms: property.bathrooms || 0,
              area: 1000,
              property_type: 'Apartment',
              year_built: null,
              parking: null,
              type: (property.type === 'rent' || property.type === 'sale') ? property.type : 'rent' as 'rent' | 'sale',
              description: property.description || '',
              is_hot_deal: property.is_hot_deal || false,
              amenities: Array.isArray(property.amenities) ? property.amenities : [],
              images: Array.isArray(property.images) ? property.images : ['/placeholder.svg'],
              videos: [],
              qr_code: '',
              owner_id: undefined,
              is_approved: true,
              created_at: property.created_at,
            };

            const ownerId = getOwnerIdForProperty(property.id);

            return (
              <div key={property.id} className="relative">
                <div className="transform scale-90 origin-top-left">
                  <PropertyCard 
                    property={transformedProperty} 
                    onClick={() => handleCardClick(property.id)}
                  />
                </div>
                <div className="absolute top-3 right-3 z-10 flex gap-1">
                  <ContactEditDialog 
                    propertyId={property.id} 
                    ownerId={ownerId}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('AdminPropertiesTab: Edit button clicked for property:', property);
                      console.log('AdminPropertiesTab: Calling onEditProperty with:', property);
                      onEditProperty(property);
                    }}
                    className="bg-white/90 backdrop-blur-sm h-8 w-8 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteProperty(property.id);
                    }}
                    className="text-red-600 hover:text-red-800 bg-white/90 backdrop-blur-sm h-8 w-8 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}

          {properties.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No properties found. Add your first property!</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AdminPropertiesTab;
