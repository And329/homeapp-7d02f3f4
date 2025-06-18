
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Heart, ChevronDown, ChevronUp } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  type: 'rent' | 'sale';
  isHotDeal?: boolean;
  description?: string;
  amenities?: string[];
}

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatPrice = (price: number, type: 'rent' | 'sale') => {
    if (type === 'rent') {
      return `AED ${price.toLocaleString()}/month`;
    }
    return `AED ${price.toLocaleString()}`;
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="property-card bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        {property.isHotDeal && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Hot Deal
          </div>
        )}
        <div className="absolute top-3 right-3 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
          For {property.type === 'rent' ? 'Rent' : 'Sale'}
        </div>
        <button className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors">
          <Heart className="h-4 w-4 text-gray-600" />
        </button>
      </div>
      
      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{property.title}</h3>
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{property.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>{property.bedrooms}</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              <span>{property.bathrooms}</span>
            </div>
            <div className="flex items-center">
              <Square className="h-4 w-4 mr-1" />
              <span>{property.area} sq ft</span>
            </div>
          </div>
        </div>

        {/* Expandable Description */}
        {isExpanded && property.description && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg animate-fade-in-up">
            <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
            <p className="text-gray-700 text-sm leading-relaxed">{property.description}</p>
            
            {property.amenities && property.amenities.length > 0 && (
              <div className="mt-3">
                <h4 className="font-semibold text-gray-900 mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.slice(0, 4).map((amenity, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      {amenity}
                    </span>
                  ))}
                  {property.amenities.length > 4 && (
                    <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                      +{property.amenities.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">
            {formatPrice(property.price, property.type)}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleExpanded}
              className="p-2 text-gray-500 hover:text-primary transition-colors"
              title={isExpanded ? 'Show less' : 'Show more'}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            <Link
              to={`/properties/${property.id}`}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
