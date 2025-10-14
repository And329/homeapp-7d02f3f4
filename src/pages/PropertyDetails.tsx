import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Bed, Bath, Square, Heart, Share2, Phone, Mail, User, QrCode } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PropertyMap from '@/components/PropertyMap';
import PropertyQRCode from '@/components/PropertyQRCode';
import PropertyPhotoGallery from '@/components/PropertyPhotoGallery';
import { getPropertyById } from '@/api/properties';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUnits } from '@/contexts/UnitsContext';
import { useFavorites } from '@/hooks/useFavorites';
import { convertArea, convertPrice, formatArea, formatPrice } from '@/utils/unitConversion';

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { unitSystem, currency } = useUnits();
  const { isFavorite, toggleFavorite, isToggling } = useFavorites();

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

  // Convert units based on user preferences
  const displayArea = property.area ? convertArea(property.area, 'metric', unitSystem) : null;
  const displayPrice = convertPrice(property.price, 'AED', currency);


  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Property Photo Gallery */}
        <div className="mb-4 sm:mb-8 -mx-3 sm:mx-0">
          <PropertyPhotoGallery 
            images={property.images || []} 
            title={property.title}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Property Header */}
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 gap-3">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">{property.title}</h1>
                  <div className="flex items-center text-gray-600 mb-2 text-sm sm:text-base">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{property.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleFavoriteToggle}
                    disabled={isToggling}
                    className="text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <Heart className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 ${isFavorite(property.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    <span className="hidden xs:inline">{isFavorite(property.id) ? 'Saved' : 'Save'}</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare} className="text-xs sm:text-sm h-8 sm:h-9">
                    <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden xs:inline">Share</span>
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">
                  {formatPrice(displayPrice, currency, property.type)}
                </span>
                {property.is_hot_deal && (
                  <Badge variant="destructive" className="text-xs">Hot Deal</Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  For {property.type === 'rent' ? 'Rent' : 'Sale'}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-gray-700 text-xs sm:text-sm">
                <div className="flex items-center">
                  <Bed className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="whitespace-nowrap">{property.bedrooms} Beds</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="whitespace-nowrap">{property.bathrooms} Baths</span>
                </div>
                <div className="flex items-center">
                  <Square className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="whitespace-nowrap">{displayArea ? formatArea(displayArea, unitSystem) : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{property.description}</p>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                      <span className="text-xs sm:text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Location</h2>
              <div className="h-48 sm:h-64 rounded-lg overflow-hidden">
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
                  height="100%"
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8 space-y-4 sm:space-y-6">
              {/* Contact Information Card */}
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  {propertyContactInfo && (propertyContactInfo.contact_name || propertyContactInfo.contact_email || propertyContactInfo.contact_phone) ? (
                    <div className="space-y-3">
                      {propertyContactInfo.contact_name && (
                        <div className="flex items-center">
                          <User className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-gray-500 flex-shrink-0" />
                          <span className="font-medium text-sm sm:text-base break-words">{propertyContactInfo.contact_name}</span>
                        </div>
                      )}
                      {propertyContactInfo.contact_email && (
                        <div className="flex items-start">
                          <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
                          <a 
                            href={`mailto:${propertyContactInfo.contact_email}`}
                            className="text-primary hover:underline text-sm sm:text-base break-all"
                          >
                            {propertyContactInfo.contact_email}
                          </a>
                        </div>
                      )}
                      {propertyContactInfo.contact_phone && (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-gray-500 flex-shrink-0" />
                          <a 
                            href={`tel:${propertyContactInfo.contact_phone}`}
                            className="text-primary hover:underline text-sm sm:text-base"
                          >
                            {propertyContactInfo.contact_phone}
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">
                      Contact information not available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Property Details */}
              <div className="bg-white border rounded-lg p-4 sm:p-6 shadow-sm">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Property Details</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-600">Property Type</span>
                    <span className="font-medium text-right">{property.property_type}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-600">Listing Type</span>
                    <span className="font-medium capitalize">{property.type}</span>
                  </div>
                  {property.year_built && (
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Year Built</span>
                      <span className="font-medium">{property.year_built}</span>
                    </div>
                  )}
                  {property.parking && (
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Parking</span>
                      <span className="font-medium">{property.parking} spaces</span>
                    </div>
                  )}
                </div>
              </div>

              {/* QR Code - Small and unobtrusive */}
              {property.qr_code && (
                <div className="bg-gray-50 border rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm text-gray-600">Legal Documentation</span>
                    <QrCode className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  </div>
                  <PropertyQRCode
                    qrCode={property.qr_code}
                    propertyTitle={property.title}
                    className="max-w-20 sm:max-w-24"
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
