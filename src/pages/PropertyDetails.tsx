
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Bed, Bath, Square, Heart, Share2, Phone, Mail, User, Camera, QrCode } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import PropertyMap from '@/components/PropertyMap';
import ContactPropertyOwner from '@/components/ContactPropertyOwner';
import PropertyQRCode from '@/components/PropertyQRCode';
import { getPropertyById } from '@/api/properties';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => getPropertyById(id!),
    enabled: !!id,
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

  // Combine images and videos for the carousel
  const allMedia = [
    ...(property.images || []).map(img => ({ type: 'image', src: img })),
    ...(property.videos || []).map(vid => ({ type: 'video', src: vid }))
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Property Media Carousel */}
        <div className="mb-8">
          {allMedia.length > 0 ? (
            <Carousel className="w-full">
              <CarouselContent>
                {allMedia.map((media, index) => (
                  <CarouselItem key={index}>
                    <div className="relative aspect-video rounded-lg overflow-hidden">
                      {media.type === 'image' ? (
                        <img
                          src={media.src}
                          alt={`${property.title} - ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={media.src}
                          className="w-full h-full object-cover"
                          controls
                        />
                      )}
                      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                        {index + 1} / {allMedia.length}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {allMedia.length > 1 && (
                <>
                  <CarouselPrevious />
                  <CarouselNext />
                </>
              )}
            </Carousel>
          ) : (
            <div className="aspect-video rounded-lg bg-gray-200 flex items-center justify-center">
              <Camera className="h-12 w-12 text-gray-400" />
            </div>
          )}
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
              {/* Contact Information */}
              <ContactPropertyOwner
                propertyId={property.id}
                ownerId={property.owner_id || ''}
                propertyTitle={property.title}
                contactName={property.contact_name || 'Property Owner'}
                contactEmail={property.contact_email || 'owner@example.com'}
                contactPhone={property.contact_phone}
                ownerProfilePicture={property.owner_profile_picture}
              />

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
