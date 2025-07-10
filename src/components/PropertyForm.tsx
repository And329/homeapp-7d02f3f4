
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import PropertyAmenities from '@/components/PropertyAmenities';
import PropertyImageUpload from '@/components/PropertyImageUpload';
import PropertyVideoUpload from '@/components/PropertyVideoUpload';
import PropertyLocationPicker from '@/components/PropertyLocationPicker';
import EmiratesSelector from '@/components/EmiratesSelector';
import QRCodeUpload from '@/components/QRCodeUpload';
import { createProperty } from '@/api/properties';
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/types/property';

interface PropertyFormProps {
  property?: Property | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  title: string;
  price: string;
  location: string;
  emirate: string;
  latitude: number | null;
  longitude: number | null;
  bedrooms: string;
  bathrooms: string;
  area: string;
  property_type: string;
  year_built: string;
  parking: string;
  type: 'rent' | 'sale';
  description: string;
  is_hot_deal: boolean;
  amenities: string[];
  images: string[];
  videos: string[];
  qr_code: string;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ property, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    price: '',
    location: '',
    emirate: '',
    latitude: null,
    longitude: null,
    bedrooms: '',
    bathrooms: '',
    area: '',
    property_type: 'Apartment',
    year_built: '',
    parking: '',
    type: 'rent',
    description: '',
    is_hot_deal: false,
    amenities: [],
    images: [],
    videos: [],
    qr_code: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log('PropertyForm: useEffect triggered with property:', property);
    if (property) {
      console.log('PropertyForm: Setting form data from property:', property);
      setFormData({
        title: property.title || '',
        price: property.price?.toString() || '',
        location: property.location || '',
        emirate: property.emirate || '',
        latitude: property.latitude,
        longitude: property.longitude,
        bedrooms: property.bedrooms?.toString() || '',
        bathrooms: property.bathrooms?.toString() || '',
        area: property.area?.toString() || '',
        property_type: property.property_type || 'Apartment',
        year_built: property.year_built?.toString() || '',
        parking: property.parking?.toString() || '',
        type: property.type || 'rent',
        description: property.description || '',
        is_hot_deal: property.is_hot_deal || false,
        amenities: Array.isArray(property.amenities) ? property.amenities : [],
        images: Array.isArray(property.images) ? property.images : [],
        videos: Array.isArray(property.videos) ? property.videos : [],
        qr_code: property.qr_code || '',
      });
    } else {
      // Reset form for new property
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
        property_type: 'Apartment',
        year_built: '',
        parking: '',
        type: 'rent',
        description: '',
        is_hot_deal: false,
        amenities: [],
        images: [],
        videos: [],
        qr_code: '',
      });
    }
  }, [property]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('PropertyForm: Submitting with data:', formData);
    console.log('PropertyForm: Property being edited:', property);

    try {
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
      if (!formData.bathrooms || parseFloat(formData.bathrooms) < 0) {
        throw new Error('Valid number of bathrooms is required');
      }
      if (!formData.qr_code.trim()) {
        throw new Error('QR code is required for legal compliance');
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
        property_type: formData.property_type,
        year_built: formData.year_built ? parseInt(formData.year_built) : null,
        parking: formData.parking ? parseInt(formData.parking) : null,
        type: formData.type,
        description: formData.description.trim(),
        is_hot_deal: formData.is_hot_deal,
        amenities: formData.amenities,
        images: formData.images,
        videos: formData.videos,
        qr_code: formData.qr_code.trim(),
      };

      console.log('PropertyForm: Data to submit:', dataToSubmit);

      if (property?.id) {
        console.log('PropertyForm: Updating existing property with ID:', property.id);
        console.log('PropertyForm: Property owner_id:', property.owner_id);
        console.log('PropertyForm: Property is_approved:', property.is_approved);

        const { error } = await supabase
          .from('properties')
          .update(dataToSubmit)
          .eq('id', property.id);

        if (error) {
          console.error('PropertyForm: Database update error:', error);
          throw new Error(`Update failed: ${error.message}`);
        }
        
        console.log('PropertyForm: Update successful!');
      } else {
        console.log('PropertyForm: Creating new property');
        await createProperty(dataToSubmit);
      }

      console.log('PropertyForm: Success!');

      toast({
        title: property ? "Property updated" : "Property created",
        description: `The property has been ${property ? 'updated' : 'created'} successfully.`,
      });

      onSuccess();
    } catch (error: any) {
      console.error('PropertyForm: Submit error:', error);
      const errorMessage = error.message || `Failed to ${property ? 'update' : 'create'} property`;
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
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
    console.log('PropertyForm: Images changed to:', images.length, 'images');
    setFormData(prev => ({ ...prev, images }));
  };

  const handleVideosChange = (videos: string[]) => {
    console.log('PropertyForm: Videos changed to:', videos.length, 'videos');
    setFormData(prev => ({ ...prev, videos }));
  };

  const handleEmirateChange = (emirate: string) => {
    setFormData(prev => ({ ...prev, emirate }));
  };

  const handleQRCodeChange = (qrCode: string) => {
    setFormData(prev => ({ ...prev, qr_code: qrCode }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {property ? 'Edit Property' : 'Add New Property'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                required
              />
            </div>

            <EmiratesSelector
              value={formData.emirate}
              onChange={handleEmirateChange}
              required
            />

            <div className="md:col-span-1">
              <PropertyLocationPicker
                location={formData.location}
                latitude={formData.latitude || undefined}
                longitude={formData.longitude || undefined}
                onLocationChange={handleLocationChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
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
                Property Type *
              </label>
              <select
                name="property_type"
                value={formData.property_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Townhouse">Townhouse</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Studio">Studio</option>
                <option value="Office">Office</option>
                <option value="Shop">Shop</option>
                <option value="Warehouse">Warehouse</option>
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year Built
              </label>
              <input
                type="number"
                name="year_built"
                value={formData.year_built}
                onChange={handleChange}
                min="1900"
                max={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
              />
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
              placeholder="Enter property description..."
            />
          </div>

          <PropertyImageUpload
            images={formData.images}
            onImagesChange={handleImagesChange}
          />

          <PropertyVideoUpload
            videos={formData.videos}
            onVideosChange={handleVideosChange}
          />

          <QRCodeUpload
            qrCode={formData.qr_code}
            onQRCodeChange={handleQRCodeChange}
            required
          />

          <PropertyAmenities
            selectedAmenities={formData.amenities}
            onAmenitiesChange={(amenities) => setFormData(prev => ({ ...prev, amenities }))}
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_hot_deal"
              checked={formData.is_hot_deal}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Mark as Hot Deal
            </label>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {property ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                property ? 'Update Property' : 'Create Property'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyForm;
