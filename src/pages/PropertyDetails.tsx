import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Bed, Bath, Square, Heart, Share2, Phone, Mail, User, QrCode, Edit } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PropertyMap from '@/components/PropertyMap';
import PropertyQRCode from '@/components/PropertyQRCode';
import PropertyPhotoGallery from '@/components/PropertyPhotoGallery';
import { getPropertyById } from '@/api/properties';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import { supabase } from '@/integrations/supabase/client';

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite, isToggling } = useFavorites();
  const queryClient = useQueryClient();
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editedContact, setEditedContact] = useState({
    contact_name: '',
    contact_email: '',
    contact_phone: ''
  });

  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => getPropertyById(id!),
    enabled: !!id,
  });

  // Get property contact information (use property's contact info or fallback to owner profile)
  const propertyContactInfo = property ? {
    contact_name: property.contact_name,
    contact_email: property.contact_email, 
    contact_phone: property.contact_phone
  } : null;

  // Debug logging
  if (property) {
    console.log('PropertyDetails: Property data:', property);
    console.log('PropertyDetails: Contact info:', propertyContactInfo);
  }

  // Fetch user profile to check if admin
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user,
  });

  // Update contact info mutation
  const updateContactMutation = useMutation({
    mutationFn: async (contactData: { contact_name: string; contact_email: string; contact_phone: string }) => {
      if (!property?.id) throw new Error('Property ID not found');
      
      const { error } = await supabase
        .from('properties')
        .update(contactData)
        .eq('id', property.id);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate the property query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['property', id] });
      setIsEditingContact(false);
      toast({
        title: "Contact updated",
        description: "Property contact information has been updated successfully.",
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

  const isAdmin = userProfile?.role === 'admin';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
            <p className="text-gray-600 mb-4">The property you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/')}>Go Back Home</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Property link has been copied to clipboard.",
      });
    }
  };

  const handleFavoriteToggle = () => {
    toggleFavorite(property.id);
  };

  const handleEditContact = () => {
    if (propertyContactInfo) {
      setEditedContact({
        contact_name: propertyContactInfo.contact_name || '',
        contact_email: propertyContactInfo.contact_email || '',
        contact_phone: propertyContactInfo.contact_phone || ''
      });
    }
    setIsEditingContact(true);
  };

  const handleSaveContact = () => {
    updateContactMutation.mutate(editedContact);
  };

  const handleCancelEdit = () => {
    setIsEditingContact(false);
    setEditedContact({ contact_name: '', contact_email: '', contact_phone: '' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Property Photo Gallery */}
        <div className="mb-8">
          <PropertyPhotoGallery 
            images={property.images || []} 
            title={property.title}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Property Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.location}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleFavoriteToggle}
                    disabled={isToggling}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${isFavorite(property.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    {isFavorite(property.id) ? 'Saved' : 'Save'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-bold text-primary">
                  AED {property.price.toLocaleString()}
                  {property.type === 'rent' && '/month'}
                </span>
                {property.is_hot_deal && (
                  <Badge variant="destructive">Hot Deal</Badge>
                )}
                <Badge variant="outline">
                  For {property.type === 'rent' ? 'Rent' : 'Sale'}
                </Badge>
              </div>

              <div className="flex items-center gap-6 text-gray-700">
                <div className="flex items-center">
                  <Bed className="h-4 w-4 mr-1" />
                  {property.bedrooms} Bedrooms
                </div>
                <div className="flex items-center">
                  <Bath className="h-4 w-4 mr-1" />
                  {property.bathrooms} Bathrooms
                </div>
                <div className="flex items-center">
                  <Square className="h-4 w-4 mr-1" />
                  {property.area} sq ft
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              <div className="h-64 rounded-lg overflow-hidden">
                <PropertyMap
                  properties={[{
                    id: property.id,
                    title: property.title,
                    location: property.location,
                    price: property.price,
                    type: property.type,
                    latitude: property.latitude || 0,
                    longitude: property.longitude || 0,
                  }]}
                  height="256px"
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Contact Information Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                    {isAdmin && !isEditingContact && (
                      <Button variant="outline" size="sm" onClick={handleEditContact}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditingContact ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="contact_name">Contact Name</Label>
                        <Input
                          id="contact_name"
                          value={editedContact.contact_name}
                          onChange={(e) => setEditedContact(prev => ({ ...prev, contact_name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact_email">Email</Label>
                        <Input
                          id="contact_email"
                          type="email"
                          value={editedContact.contact_email}
                          onChange={(e) => setEditedContact(prev => ({ ...prev, contact_email: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact_phone">Phone</Label>
                        <Input
                          id="contact_phone"
                          value={editedContact.contact_phone}
                          onChange={(e) => setEditedContact(prev => ({ ...prev, contact_phone: e.target.value }))}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleSaveContact} 
                          disabled={updateContactMutation.isPending}
                          size="sm"
                        >
                          Save
                        </Button>
                        <Button variant="outline" onClick={handleCancelEdit} size="sm">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : propertyContactInfo && (propertyContactInfo.contact_name || propertyContactInfo.contact_email || propertyContactInfo.contact_phone) ? (
                    <div className="space-y-3">
                      {propertyContactInfo.contact_name && (
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="font-medium">{propertyContactInfo.contact_name}</span>
                        </div>
                      )}
                      {propertyContactInfo.contact_email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-500" />
                          <a 
                            href={`mailto:${propertyContactInfo.contact_email}`}
                            className="text-primary hover:underline"
                          >
                            {propertyContactInfo.contact_email}
                          </a>
                        </div>
                      )}
                      {propertyContactInfo.contact_phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-500" />
                          <a 
                            href={`tel:${propertyContactInfo.contact_phone}`}
                            className="text-primary hover:underline"
                          >
                            {propertyContactInfo.contact_phone}
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      Contact information not available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Property Details */}
              <div className="bg-white border rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Property Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property Type</span>
                    <span className="font-medium">{property.property_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Listing Type</span>
                    <span className="font-medium capitalize">{property.type}</span>
                  </div>
                  {property.year_built && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Year Built</span>
                      <span className="font-medium">{property.year_built}</span>
                    </div>
                  )}
                  {property.parking && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Parking</span>
                      <span className="font-medium">{property.parking} spaces</span>
                    </div>
                  )}
                </div>
              </div>

              {/* QR Code - Small and unobtrusive */}
              {property.qr_code && (
                <div className="bg-gray-50 border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Legal Documentation</span>
                    <QrCode className="h-4 w-4 text-gray-400" />
                  </div>
                  <PropertyQRCode
                    qrCode={property.qr_code}
                    propertyTitle={property.title}
                    className="max-w-24"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PropertyDetails;
