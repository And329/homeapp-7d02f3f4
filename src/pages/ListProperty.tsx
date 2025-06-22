
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building, MapPin, DollarSign, Home, Send, Square } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import PropertyAmenities from '@/components/PropertyAmenities';
import PropertyImageUpload from '@/components/PropertyImageUpload';
import PropertyVideoUpload from '@/components/PropertyVideoUpload';
import PropertyLocationPicker from '@/components/PropertyLocationPicker';
import EmiratesSelector from '@/components/EmiratesSelector';
import QRCodeUpload from '@/components/QRCodeUpload';

const propertyRequestSchema = z.object({
  title: z.string().min(1, 'Property title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.string().min(1, 'Price is required'),
  location: z.string().min(1, 'Location is required'),
  emirate: z.string().min(1, 'Emirate is required'),
  area: z.string().min(1, 'Area is required'),
  bedrooms: z.string().min(1, 'Number of bedrooms is required'),
  bathrooms: z.string().min(1, 'Number of bathrooms is required'),
  type: z.enum(['rent', 'sale']),
  propertyType: z.string().min(1, 'Property type is required'),
  contactName: z.string().min(1, 'Contact name is required'),
  contactEmail: z.string().email('Valid email is required'),
  contactPhone: z.string().optional(),
  submitterType: z.enum(['owner', 'broker', 'referral']),
  qrCode: z.string().min(1, 'QR code is required for legal compliance'),
});

type PropertyRequestForm = z.infer<typeof propertyRequestSchema>;

const ListProperty = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  const [propertyVideos, setPropertyVideos] = useState<string[]>([]);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [selectedEmirate, setSelectedEmirate] = useState('');
  const [qrCode, setQrCode] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<PropertyRequestForm>({
    resolver: zodResolver(propertyRequestSchema),
    defaultValues: {
      title: '',
      description: '',
      price: '',
      location: '',
      emirate: '',
      area: '',
      bedrooms: '',
      bathrooms: '',
      type: 'sale',
      propertyType: 'Apartment',
      contactName: '',
      contactEmail: user?.email || '',
      contactPhone: '',
      submitterType: 'owner',
      qrCode: '',
    },
  });

  const handleLocationChange = (location: string, lat?: number, lng?: number) => {
    form.setValue('location', location);
    setLatitude(lat || null);
    setLongitude(lng || null);
  };

  const handleEmirateChange = (emirate: string) => {
    setSelectedEmirate(emirate);
    form.setValue('emirate', emirate);
  };

  const handleQRCodeChange = (qrCodeValue: string) => {
    setQrCode(qrCodeValue);
    form.setValue('qrCode', qrCodeValue);
  };

  const onSubmit = async (data: PropertyRequestForm) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit a property listing request.",
        variant: "destructive",
      });
      return;
    }

    if (!qrCode.trim()) {
      toast({
        title: "QR Code Required",
        description: "QR code is required for legal compliance.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('property_requests')
        .insert({
          user_id: user.id,
          title: data.title,
          description: data.description,
          price: parseInt(data.price),
          location: data.location,
          emirate: data.emirate,
          latitude: latitude,
          longitude: longitude,
          area: parseInt(data.area),
          bedrooms: parseInt(data.bedrooms),
          bathrooms: parseInt(data.bathrooms),
          type: data.type,
          property_type: data.propertyType,
          amenities: selectedAmenities,
          images: propertyImages,
          videos: propertyVideos,
          contact_name: data.contactName,
          contact_email: data.contactEmail,
          contact_phone: data.contactPhone || null,
          submitter_type: data.submitterType,
          qr_code: qrCode,
        });

      if (error) throw error;

      toast({
        title: "Property Listing Submitted!",
        description: "Your property listing request has been submitted for admin review. You'll be notified once it's approved.",
      });

      form.reset();
      setSelectedAmenities([]);
      setPropertyImages([]);
      setPropertyVideos([]);
      setLatitude(null);
      setLongitude(null);
      setSelectedEmirate('');
      setQrCode('');
    } catch (error) {
      console.error('Error submitting property request:', error);
      toast({
        title: "Error",
        description: "Failed to submit property listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <section className="uae-gradient text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">List Your Property</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Submit your property for listing on HomeApp. Our team will review and approve your submission.
            </p>
          </div>
        </div>
      </section>

      {/* Property Listing Form */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Building className="h-6 w-6 mr-2 text-primary" />
              Property Details
            </h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Luxurious 3BR Apartment in Downtown Dubai" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Listing Type *</FormLabel>
                        <FormControl>
                          <select {...field} className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring">
                            <option value="sale">For Sale</option>
                            <option value="rent">For Rent</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your property in detail..."
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Property Specifications */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          Price (AED) *
                        </FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="5000000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Square className="h-4 w-4 mr-1" />
                          Area (sq ft) *
                        </FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="1200" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bedrooms *</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bathrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bathrooms *</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <EmiratesSelector
                      value={selectedEmirate}
                      onChange={handleEmirateChange}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <PropertyLocationPicker
                      location={form.watch('location')}
                      latitude={latitude || undefined}
                      longitude={longitude || undefined}
                      onLocationChange={handleLocationChange}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Home className="h-4 w-4 mr-1" />
                        Property Type *
                      </FormLabel>
                      <FormControl>
                        <select {...field} className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring">
                          <option value="Apartment">Apartment</option>
                          <option value="Villa">Villa</option>
                          <option value="Townhouse">Townhouse</option>
                          <option value="Penthouse">Penthouse</option>
                          <option value="Studio">Studio</option>
                          <option value="Office">Office</option>
                          <option value="Shop">Shop</option>
                          <option value="Warehouse">Warehouse</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* QR Code Upload */}
                <div>
                  <QRCodeUpload
                    qrCode={qrCode}
                    onQRCodeChange={handleQRCodeChange}
                    required
                  />
                  <FormField
                    control={form.control}
                    name="qrCode"
                    render={() => (
                      <FormMessage />
                    )}
                  />
                </div>

                {/* Amenities */}
                <PropertyAmenities
                  selectedAmenities={selectedAmenities}
                  onAmenitiesChange={setSelectedAmenities}
                />

                {/* Images */}
                <PropertyImageUpload
                  images={propertyImages}
                  onImagesChange={setPropertyImages}
                />

                {/* Videos */}
                <PropertyVideoUpload
                  videos={propertyVideos}
                  onVideosChange={setPropertyVideos}
                />

                {/* Contact Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <FormField
                      control={form.control}
                      name="contactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your.email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+971 50 123 4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="submitterType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>I am the *</FormLabel>
                          <FormControl>
                            <select {...field} className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring">
                              <option value="owner">Property Owner</option>
                              <option value="broker">Real Estate Broker</option>
                              <option value="referral">Referral Agent</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Your property listing will be reviewed by our team before being published. 
                    We'll contact you within 24-48 hours regarding the status of your submission. QR code is required for UAE legal compliance.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !user}
                  className="w-full bg-primary text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Submitting...' : 'Submit Property Listing'}
                </Button>

                {!user && (
                  <p className="text-center text-sm text-gray-600">
                    Please <a href="/auth" className="text-primary underline">sign in</a> to submit a property listing.
                  </p>
                )}
              </form>
            </Form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ListProperty;
