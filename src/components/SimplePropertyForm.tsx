
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import PropertyAmenities from '@/components/PropertyAmenities';
import PropertyImageUpload from '@/components/PropertyImageUpload';
import PropertyVideoUpload from '@/components/PropertyVideoUpload';
import PropertyLocationPicker from '@/components/PropertyLocationPicker';
import EmiratesSelector from '@/components/EmiratesSelector';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SimplePropertyFormProps {
  onSuccess?: () => void;
}

const SimplePropertyForm: React.FC<SimplePropertyFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    location: '',
    emirate: '',
    latitude: null as number | null,
    longitude: null as number | null,
    bedrooms: '',
    bathrooms: '',
    area: '',
    propertyType: '',
    type: 'rent' as 'rent' | 'sale',
    description: '',
    amenities: [] as string[],
    images: [] as string[],
    videos: [] as string[],
    yearBuilt: '',
    parking: '',
    submitterType: 'owner' as 'owner' | 'broker' | 'referral',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) {
        throw new Error('You must be logged in to submit a property request');
      }

      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.price || parseInt(formData.price) <= 0) {
        throw new Error('Valid price is required');
      }
      if (!formData.location.trim()) {
        throw new Error('Location is required');
      }
      if (!formData.emirate) {
        throw new Error('Emirate is required');
      }
      if (!formData.bedrooms || parseInt(formData.bedrooms) < 0) {
        throw new Error('Valid number of bedrooms is required');
      }
      if (!formData.bathrooms || parseInt(formData.bathrooms) < 0) {
        throw new Error('Valid number of bathrooms is required');
      }

      const dataToSubmit = {
        title: formData.title.trim(),
        price: parseInt(formData.price),
        location: formData.location.trim(),
        emirate: formData.emirate,
        latitude: formData.latitude,
        longitude: formData.longitude,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseFloat(formData.bathrooms),
        area: formData.area ? parseInt(formData.area) : null,
        property_type: formData.propertyType || null,
        type: formData.type,
        description: formData.description.trim(),
        amenities: formData.amenities,
        images: formData.images,
        videos: formData.videos,
        year_built: formData.yearBuilt ? parseInt(formData.yearBuilt) : null,
        parking: formData.parking ? parseInt(formData.parking) : null,
        submitter_type: formData.submitterType,
        user_id: user.id,
        status: 'pending',
        contact_name: formData.contact_name.trim(),
        contact_email: formData.contact_email.trim(),
        contact_phone: formData.contact_phone.trim(),
      };

      const { error } = await supabase
        .from('property_requests')
        .insert([dataToSubmit]);

      if (error) throw error;

      toast({
        title: "Property request submitted",
        description: "Your property has been submitted for review. You'll be notified once it's approved.",
      });

      // Reset form
      setFormData({
        title: '',
        price: '',
        location: '',
        emirate: '',
        latitude: null,
        longitude: null,
        bedrooms: '',
        bathrooms: '',
        area: '',
        propertyType: '',
        type: 'rent',
        description: '',
        amenities: [],
        images: [],
        videos: [],
        yearBuilt: '',
        parking: '',
        submitterType: 'owner',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit property request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (location: string, lat?: number, lng?: number) => {
    setFormData(prev => ({
      ...prev,
      location,
      latitude: lat || null,
      longitude: lng || null,
    }));
  };

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({ ...prev, images }));
  };

  const handleVideosChange = (videos: string[]) => {
    setFormData(prev => ({ ...prev, videos }));
  };

  const handleEmirateChange = (emirate: string) => {
    setFormData(prev => ({ ...prev, emirate }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Property Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="e.g., Beautiful 2BR Apartment in Dubai Marina"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price (AED) *
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="e.g., 120000"
            required
          />
        </div>

        <EmiratesSelector
          value={formData.emirate}
          onChange={handleEmirateChange}
          required
        />

        <div>
          <PropertyLocationPicker
            location={formData.location}
            latitude={formData.latitude || undefined}
            longitude={formData.longitude || undefined}
            onLocationChange={handleLocationChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Property Type
          </label>
          <select
            name="propertyType"
            value={formData.propertyType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Select property type</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="Townhouse">Townhouse</option>
            <option value="Studio">Studio</option>
            <option value="Penthouse">Penthouse</option>
            <option value="Office">Office</option>
            <option value="Shop">Shop</option>
            <option value="Warehouse">Warehouse</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Listing Type *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          >
            <option value="rent">For Rent</option>
            <option value="sale">For Sale</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bedrooms *
          </label>
          <input
            type="number"
            name="bedrooms"
            value={formData.bedrooms}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bathrooms *
          </label>
          <input
            type="number"
            name="bathrooms"
            value={formData.bathrooms}
            onChange={handleChange}
            min="0"
            step="0.5"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Area (sq ft)
          </label>
          <input
            type="number"
            name="area"
            value={formData.area}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="e.g., 1200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Year Built
          </label>
          <input
            type="number"
            name="yearBuilt"
            value={formData.yearBuilt}
            onChange={handleChange}
            min="1900"
            max={new Date().getFullYear()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="e.g., 2020"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Parking Spaces
          </label>
          <input
            type="number"
            name="parking"
            value={formData.parking}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="e.g., 2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Submitter Type *
          </label>
          <select
            name="submitterType"
            value={formData.submitterType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          >
            <option value="owner">Property Owner</option>
            <option value="broker">Real Estate Broker</option>
            <option value="referral">Referral/Agent</option>
          </select>
        </div>
      </div>

      {/* Contact Information */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Name
            </label>
            <input
              type="text"
              name="contact_name"
              value={formData.contact_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              name="contact_email"
              value={formData.contact_email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Phone
            </label>
            <input
              type="tel"
              name="contact_phone"
              value={formData.contact_phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="+971 XX XXX XXXX"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Describe your property, its features, nearby amenities, etc."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PropertyImageUpload
          images={formData.images}
          onImagesChange={handleImagesChange}
        />

        <PropertyVideoUpload
          videos={formData.videos}
          onVideosChange={handleVideosChange}
        />
      </div>

      <PropertyAmenities
        selectedAmenities={formData.amenities}
        onAmenitiesChange={(amenities) => setFormData(prev => ({ ...prev, amenities }))}
      />

      <div className="pt-6">
        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Submitting...
            </div>
          ) : (
            'Submit Property Request'
          )}
        </Button>
      </div>
    </form>
  );
};

export default SimplePropertyForm;
