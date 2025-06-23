
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Bed, Bath, Square, Heart, Share2, Phone, Mail, User, QrCode } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PropertyMap from '@/components/PropertyMap';
import PropertyQRCode from '@/components/PropertyQRCode';
import { getPropertyById } from '@/api/properties';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => getPropertyById(id!),
    enabled: !!id,
  });

  // Fetch owner contact information
  const { data: ownerProfile } = useQuery({
    queryKey: ['owner-profile', property?.owner_id],
    queryFn: async () => {
      if (!property?.owner_id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('id', property.owner_id)
        .single();
      
      if (error) {
        console.error('Error fetching owner profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!property?.owner_id,
  });

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

  const handleAddToFavorites = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add properties to favorites.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Added to favorites!",
      description: "Property has been added to your favorites.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Property Images */}
        <div className="mb-8">
          <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
            <img
              src={property.images[selectedImageIndex]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            {property.images.length > 1 && (
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                {selectedImageIndex + 1} / {property.images.length}
              </div>
            )}
          </div>
          
          {property.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {property.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImageIndex === index ? 'border-primary' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Property ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Videos Section */}
        {property.videos && property.videos.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Property Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {property.videos.map((video, index) => (
                <div key={index} className="aspect-video rounded-lg overflow-hidden">
                  <video
                    controls
                    className="w-full h-full object-cover"
                    src={video}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              ))}
            </div>
          </div>
        )}

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
                  <Button variant="outline" size="sm" onClick={handleAddToFavorites}>
                    <Heart className="h-4 w-4 mr-1" />
                    Save
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
                {property.isHotDeal && (
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
                    id: parseInt(property.id) || 0,
                    title: property.title,
                    location: property.location,
                    price: property.price,
                    type: property.type,
                    latitude: property.coordinates.lat,
                    longitude: property.coordinates.lng,
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
              <div className="bg-white border rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                {ownerProfile ? (
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium">{ownerProfile.full_name || 'Property Owner'}</span>
                    </div>
                    {ownerProfile.email && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        <a 
                          href={`mailto:${ownerProfile.email}`}
                          className="text-primary hover:underline"
                        >
                          {ownerProfile.email}
                        </a>
                      </div>
                    )}
                    {ownerProfile.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        <a 
                          href={`tel:${ownerProfile.phone}`}
                          className="text-primary hover:underline"
                        >
                          {ownerProfile.phone}
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500">
                    Contact information not available
                  </div>
                )}
              </div>

              {/* Property Details */}
              <div className="bg-white border rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Property Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property Type</span>
                    <span className="font-medium">{property.propertyType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Listing Type</span>
                    <span className="font-medium capitalize">{property.type}</span>
                  </div>
                  {property.yearBuilt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Year Built</span>
                      <span className="font-medium">{property.yearBuilt}</span>
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
