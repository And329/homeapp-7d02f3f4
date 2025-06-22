
import React from 'react';
import EmiratesSelector from '@/components/EmiratesSelector';
import PropertyLocationPicker from '@/components/PropertyLocationPicker';

interface PropertyBasicInfoProps {
  formData: {
    title: string;
    price: string;
    emirate: string;
    location: string;
    latitude: number | null;
    longitude: number | null;
    type: 'rent' | 'sale';
    bedrooms: string;
    bathrooms: string;
    description: string;
    is_hot_deal: boolean;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleLocationChange: (location: string, lat?: number, lng?: number) => void;
  handleEmirateChange: (emirate: string) => void;
}

const PropertyBasicInfo: React.FC<PropertyBasicInfoProps> = ({
  formData,
  handleChange,
  handleLocationChange,
  handleEmirateChange,
}) => {
  return (
    <>
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
    </>
  );
};

export default PropertyBasicInfo;
