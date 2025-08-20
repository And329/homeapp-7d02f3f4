
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building, MapPin, DollarSign, Home, Send, Square, MessageSquare } from 'lucide-react';
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
import PropertyMediaUpload from '@/components/PropertyMediaUpload';

import PropertyLocationPicker from '@/components/PropertyLocationPicker';
import EmiratesSelector from '@/components/EmiratesSelector';

const propertyRequestSchema = z.object({
  title: z.string().min(1, 'Property title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.string().min(1, 'Price is required'),
  location: z.string().min(1, 'Location is required'),
  emirate: z.string().min(1, 'Emirate is required'),
  area: z.string().min(1, 'Area is required').refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Area must be a valid positive number'),
  yearBuilt: z.string().optional(),
  parkingSpaces: z.string().optional(),
  bedrooms: z.string().min(1, 'Number of bedrooms is required'),
  bathrooms: z.string().min(1, 'Number of bathrooms is required'),
  type: z.enum(['rent', 'sale']),
  propertyType: z.string().min(1, 'Property type is required'),
  contactName: z.string().min(1, 'Contact name is required'),
  contactEmail: z.string().email('Valid email is required'),
  contactPhone: z.string().optional(),
  submitterType: z.enum(['owner', 'broker', 'referral']),
  userMessage: z.string().optional(),
});

type PropertyRequestForm = z.infer<typeof propertyRequestSchema>;

const ListProperty = () => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [selectedEmirate, setSelectedEmirate] = useState('');
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
      yearBuilt: '',
      parkingSpaces: '',
      bedrooms: '',
      bathrooms: '',
      type: 'sale',
      propertyType: 'Apartment',
      contactName: '',
      contactEmail: user?.email || '',
      contactPhone: '',
      submitterType: 'owner',
      userMessage: '',
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


  const onSubmit = async (data: PropertyRequestForm) => {
    if (!user) {
      toast({
        title: t('listProperty.form.authError'),
        description: t('listProperty.form.authErrorMessage'),
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
          area: parseFloat(data.area),
          year_built: data.yearBuilt ? parseInt(data.yearBuilt) : null,
          parking: data.parkingSpaces ? parseInt(data.parkingSpaces) : null,
          bedrooms: parseInt(data.bedrooms),
          bathrooms: parseInt(data.bathrooms),
          type: data.type,
          property_type: data.propertyType,
          amenities: selectedAmenities,
          images: propertyImages,
          
          contact_name: data.contactName,
          contact_email: data.contactEmail,
          contact_phone: data.contactPhone || null,
          submitter_type: data.submitterType,
          user_message: data.userMessage || null,
        });

      if (error) throw error;

      toast({
        title: t('listProperty.form.success'),
        description: t('listProperty.form.successMessage'),
      });

      form.reset();
      setSelectedAmenities([]);
      setPropertyImages([]);
      
      setLatitude(null);
      setLongitude(null);
      setSelectedEmirate('');
    } catch (error) {
      console.error('Error submitting property request:', error);
      toast({
        title: t('listProperty.form.error'),
        description: t('listProperty.form.errorMessage'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect to auth if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="mb-6">
                <div className="bg-primary text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Building className="h-8 w-8" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('listProperty.authRequired.title')}</h1>
                <p className="text-lg text-gray-600 mb-6">
                  {t('listProperty.authRequired.message')}
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-green-700 font-semibold">
                    {t('listProperty.authRequired.freeNotice')}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => window.location.href = '/auth'}
                  className="px-6 py-3"
                >
                  {t('listProperty.authRequired.createAccount')}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/auth'}
                  className="px-6 py-3"
                >
                  {t('listProperty.authRequired.signIn')}
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <section className="uae-gradient text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('listProperty.title')}</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              {t('listProperty.subtitle')}
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
              {t('listProperty.form.propertyDetails')}
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
                        <FormLabel>{t('listProperty.form.propertyTitle')} *</FormLabel>
                        <FormControl>
                          <Input placeholder={t('listProperty.form.propertyTitlePlaceholder')} {...field} />
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
                        <FormLabel>{t('listProperty.form.listingType')} *</FormLabel>
                        <FormControl>
                          <select {...field} className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring">
                            <option value="sale">{t('listProperty.form.forSale')}</option>
                            <option value="rent">{t('listProperty.form.forRent')}</option>
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
                      <FormLabel>{t('listProperty.form.description')} *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={t('listProperty.form.descriptionPlaceholder')}
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Property Specifications */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {t('listProperty.form.price')} *
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
                          {t('listProperty.form.area')} *
                        </FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="120.50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="yearBuilt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('listProperty.form.yearBuilt')}</FormLabel>
                        <FormControl>
                          <Input type="number" min="1900" max={new Date().getFullYear()} placeholder="2020" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="bedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('listProperty.form.bedrooms')} *</FormLabel>
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
                        <FormLabel>{t('listProperty.form.bathrooms')} *</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="parkingSpaces"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('listProperty.form.parkingSpaces')}</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" placeholder="2" {...field} />
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
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <PropertyLocationPicker
                        location={form.watch('location')}
                        latitude={latitude || undefined}
                        longitude={longitude || undefined}
                        onLocationChange={handleLocationChange}
                      />
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Home className="h-4 w-4 mr-1" />
                        {t('listProperty.form.propertyType')} *
                      </FormLabel>
                      <FormControl>
                        <select {...field} className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring">
                          <option value="Apartment">{t('listProperty.form.apartment')}</option>
                          <option value="Villa">{t('listProperty.form.villa')}</option>
                          <option value="Townhouse">{t('listProperty.form.townhouse')}</option>
                          <option value="Penthouse">{t('listProperty.form.penthouse')}</option>
                          <option value="Studio">{t('listProperty.form.studio')}</option>
                          <option value="Office">{t('listProperty.form.office')}</option>
                          <option value="Shop">{t('listProperty.form.shop')}</option>
                          <option value="Warehouse">{t('listProperty.form.warehouse')}</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                {/* Amenities */}
                <PropertyAmenities
                  selectedAmenities={selectedAmenities}
                  onAmenitiesChange={setSelectedAmenities}
                />

                {/* Images */}
                <PropertyMediaUpload
                  images={propertyImages}
                  onImagesChange={setPropertyImages}
                />


                {/* Contact Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">{t('listProperty.form.contactInformation')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <FormField
                      control={form.control}
                      name="contactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('listProperty.form.contactName')} *</FormLabel>
                          <FormControl>
                            <Input placeholder={t('listProperty.form.contactNamePlaceholder')} {...field} />
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
                          <FormLabel>{t('listProperty.form.contactEmail')} *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder={t('listProperty.form.contactEmailPlaceholder')} {...field} />
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
                          <FormLabel>{t('listProperty.form.contactPhone')}</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder={t('listProperty.form.contactPhonePlaceholder')} {...field} />
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
                          <FormLabel>{t('listProperty.form.submitterType')} *</FormLabel>
                          <FormControl>
                            <select {...field} className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring">
                              <option value="owner">{t('listProperty.form.owner')}</option>
                              <option value="broker">{t('listProperty.form.broker')}</option>
                              <option value="referral">{t('listProperty.form.referral')}</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Message for Admin */}
                <div className="border-t pt-6">
                  <FormField
                    control={form.control}
                    name="userMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message for Admin (Optional)
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Leave a message or special instructions for our admin team..."
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Your property listing will be reviewed by our team before being published. 
                    We'll contact you within 24-48 hours regarding the status of your submission. QR codes will be added by the admin after approval.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !user}
                  className="w-full bg-primary text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? t('listProperty.form.submitting') : t('listProperty.form.submitButton')}
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
