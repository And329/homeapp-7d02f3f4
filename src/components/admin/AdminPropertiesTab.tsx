import React, { useState } from 'react';
import { Plus, Map, Edit, Trash2, User, Search, EyeOff, Eye } from 'lucide-react';
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
  area: number | null;
  type: 'rent' | 'sale';
  is_hot_deal: boolean;
  description: string;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
  amenities: string[] | null;
  images: string[] | null;
  emirate: string;
  property_type: string;
  year_built: number | null;
  parking: number | null;
  qr_code: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  admin_notes: string;
  owner_id?: string;
  is_approved: boolean;
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
        <Button variant="outline" size="sm" className="bg-white/95 backdrop-blur-sm shadow-md border-white/20 hover:bg-white h-9 w-9 p-0">
          <User className="h-4 w-4" />
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
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
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

  // Toggle property visibility mutation
  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ propertyId, isApproved }: { propertyId: string; isApproved: boolean }) => {
      const { error } = await supabase
        .from('properties')
        .update({ is_approved: !isApproved })
        .eq('id', propertyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties-with-owners'] });
      toast({
        title: "Visibility updated",
        description: "Property visibility has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update visibility: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleCardClick = (propertyId: string) => {
    navigate(`/properties/${propertyId}`);
  };

  // Filter properties based on search term
  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="mb-6 space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search properties by title, location, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center justify-between">
          <Button
            onClick={onAddProperty}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Property
          </Button>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowMap(!showMap)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Map className="h-4 w-4" />
              {showMap ? 'Hide Map' : 'Show Map'}
            </Button>
          </div>
        </div>
      </div>

      {showMap && (
        <div className="mb-6">
          <PropertyMap
            properties={filteredProperties.map(p => ({
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((property) => {
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
              area: property.area || null,
              property_type: 'Apartment',
              year_built: null,
              parking: null,
              type: (property.type === 'rent' || property.type === 'sale') ? property.type : 'rent' as 'rent' | 'sale',
              description: property.description || '',
              is_hot_deal: property.is_hot_deal || false,
              amenities: Array.isArray(property.amenities) ? property.amenities : [],
              images: Array.isArray(property.images) ? property.images : ['/placeholder.svg'],
              
              qr_code: '',
              owner_id: undefined,
              is_approved: true,
              created_at: property.created_at,
            };

            const ownerId = getOwnerIdForProperty(property.id);

            return (
              <div key={property.id} className="relative group">
                <PropertyCard 
                  property={transformedProperty} 
                  onClick={() => handleCardClick(property.id)}
                />

                {/* Admin Section Below Card */}
                <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  {/* Admin Notes */}
                  {property.admin_notes && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">Admin Notes:</p>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {property.admin_notes}
                      </p>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 justify-between">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('AdminPropertiesTab: Edit button clicked for property:', property);
                          console.log('AdminPropertiesTab: Calling onEditProperty with:', property);
                          onEditProperty(property);
                        }}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProperty(property.id);
                        }}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                    
                    {/* Visibility Toggle */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVisibilityMutation.mutate({
                          propertyId: property.id,
                          isApproved: property.is_approved
                        });
                      }}
                      disabled={toggleVisibilityMutation.isPending}
                      className={`flex items-center gap-1 ${
                        property.is_approved 
                          ? 'text-green-600 hover:text-green-700 hover:bg-green-50' 
                          : 'text-gray-600 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {property.is_approved ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      {property.is_approved ? 'Public' : 'Hidden'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredProperties.length === 0 && properties.length > 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No properties match your search.</p>
            </div>
          )}

          {properties.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No properties found. Add your first property!</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AdminPropertiesTab;
