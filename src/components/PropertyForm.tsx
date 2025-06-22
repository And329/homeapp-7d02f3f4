
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PropertyBasicInfo from '@/components/PropertyBasicInfo';
import PropertyContactInfo from '@/components/PropertyContactInfo';
import PropertyMediaSection from '@/components/PropertyMediaSection';
import PropertyFormActions from '@/components/PropertyFormActions';
import { createProperty } from '@/api/properties';
import { supabase } from '@/integrations/supabase/client';

interface PropertyFormProps {
  property?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ property, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    location: '',
    emirate: '',
    latitude: null as number | null,
    longitude: null as number | null,
    bedrooms: '',
    bathrooms: '',
    type: 'rent' as 'rent' | 'sale',
    description: '',
    is_hot_deal: false,
    amenities: [] as string[],
    images: [] as string[],
    videos: [] as string[],
    qr_code: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log('PropertyForm: useEffect triggered with property:', property);
    if (property) {
      // Handle different property data structures (from admin vs regular API)
      const newFormData = {
        title: property.title || '',
        price: property.price?.toString() || '',
        location: property.location || '',
        emirate: property.emirate || '',
        latitude: property.latitude || property.coordinates?.lat || null,
        longitude: property.longitude || property.coordinates?.lng || null,
        bedrooms: property.bedrooms?.toString() || '',
        bathrooms: property.bathrooms?.toString() || '',
        type: property.type || 'rent',
        description: property.description || '',
        is_hot_deal: property.is_hot_deal || property.isHotDeal || false,
        amenities: Array.isArray(property.amenities) ? property.amenities : [],
        images: Array.isArray(property.images) && property.images.length > 0 ? property.images : [],
        videos: Array.isArray(property.videos) && property.videos.length > 0 ? property.videos : [],
        qr_code: property.qr_code || '',
        contact_name: property.contact_name || '',
        contact_email: property.contact_email || '',
        contact_phone: property.contact_phone || '',
      };
      console.log('PropertyForm: Setting form data from property:', newFormData);
      setFormData(newFormData);
    } else {
      // Reset form for new property
      const resetFormData = {
        title: '',
        price: '',
        location: '',
        emirate: '',
        latitude: null as number | null,
        longitude: null as number | null,
        bedrooms: '',
        bathrooms: '',
        type: 'rent' as 'rent' | 'sale',
        description: '',
        is_hot_deal: false,
        amenities: [] as string[],
        images: [] as string[],
        videos: [] as string[],
        qr_code: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
      };
      console.log('PropertyForm: Resetting form data for new property');
      setFormData(resetFormData);
    }
  }, [property]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('PropertyForm: Submitting with data:', formData);

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
      if (!formData.bathrooms || parseInt(formData.bathrooms) < 0) {
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
        type: formData.type,
        description: formData.description.trim(),
        is_hot_deal: formData.is_hot_deal,
        amenities: formData.amenities,
        images: formData.images,
        videos: formData.videos,
        qr_code: formData.qr_code.trim(),
        contact_name: formData.contact_name.trim(),
        contact_email: formData.contact_email.trim(),
        contact_phone: formData.contact_phone.trim(),
      };

      console.log('PropertyForm: Data to submit:', dataToSubmit);

      if (property && property.id) {
        console.log('PropertyForm: Updating existing property with ID:', property.id);
        
        // Ensure we have a valid UUID string
        let propertyId: string;
        if (typeof property.id === 'number') {
          // This shouldn't happen for real UUIDs, but handle the case
          throw new Error('Invalid property ID: expected UUID string, got number');
        } else {
          propertyId = String(property.id);
        }
        
        console.log('PropertyForm: Using property ID:', propertyId);

        // Validate that it looks like a UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(propertyId)) {
          throw new Error('Invalid property ID format. Expected UUID.');
        }

        const { error } = await supabase
          .from('properties')
          .update(dataToSubmit)
          .eq('id', propertyId);

        if (error) {
          console.error('PropertyForm: Database update error:', error);
          throw new Error(`Update failed: ${error.message}`);
        }
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

  const handleAmenitiesChange = (amenities: string[]) => {
    setFormData(prev => ({ ...prev, amenities }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
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
          <PropertyBasicInfo
            formData={formData}
            handleChange={handleChange}
            handleLocationChange={handleLocationChange}
            handleEmirateChange={handleEmirateChange}
          />

          <PropertyContactInfo
            formData={formData}
            handleChange={handleChange}
          />

          <PropertyMediaSection
            formData={formData}
            onImagesChange={handleImagesChange}
            onVideosChange={handleVideosChange}
            onQRCodeChange={handleQRCodeChange}
            onAmenitiesChange={handleAmenitiesChange}
          />

          <PropertyFormActions
            loading={loading}
            isEditing={!!property}
            onCancel={onClose}
          />
        </form>
      </div>
    </div>
  );
};

export default PropertyForm;
