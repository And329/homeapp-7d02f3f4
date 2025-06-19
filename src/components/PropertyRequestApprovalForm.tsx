import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import PropertyAmenities from '@/components/PropertyAmenities';
import PropertyImageUpload from '@/components/PropertyImageUpload';
import PropertyLocationPicker from '@/components/PropertyLocationPicker';
import { PropertyRequest } from '@/types/propertyRequest';

interface PropertyRequestApprovalFormProps {
  request: PropertyRequest;
  onClose: () => void;
  onApprove: (requestId: string, updatedData: any) => void;
}

const PropertyRequestApprovalForm: React.FC<PropertyRequestApprovalFormProps> = ({
  request,
  onClose,
  onApprove,
}) => {
  const [formData, setFormData] = useState({
    title: request.title || '',
    price: request.price?.toString() || '',
    location: request.location || '',
    latitude: request.latitude || null,
    longitude: request.longitude || null,
    bedrooms: request.bedrooms?.toString() || '',
    bathrooms: request.bathrooms?.toString() || '',
    type: request.type || 'rent',
    description: request.description || '',
    amenities: request.amenities || [],
    images: request.images || [],
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedData = {
        title: formData.title,
        price: parseInt(formData.price),
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        type: formData.type,
        description: formData.description,
        amenities: formData.amenities,
        images: formData.images,
      };

      console.log('Submitting approval with data:', updatedData);
      await onApprove(request.id, updatedData);
      onClose();
    } catch (error) {
      console.error('Approval error:', error);
      toast({
        title: "Error",
        description: "Failed to approve request. Please try again.",
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            Approve Property Request
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

            <div className="md:col-span-2">
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

          <PropertyAmenities
            selectedAmenities={formData.amenities}
            onAmenitiesChange={(amenities) => setFormData(prev => ({ ...prev, amenities }))}
          />

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
                  Approving...
                </div>
              ) : (
                'Approve Request'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyRequestApprovalForm;
