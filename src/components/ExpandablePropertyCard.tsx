
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, Bed, Bath, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExpandablePropertyCardProps {
  property: any;
  onEdit?: (property: any) => void;
  onDelete?: (id: number) => void;
  showActions?: boolean;
}

const ExpandablePropertyCard: React.FC<ExpandablePropertyCardProps> = ({
  property,
  onEdit,
  onDelete,
  showActions = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatPrice = (price: number, type: string) => {
    if (type === 'rent') {
      return `AED ${price.toLocaleString()}/month`;
    }
    return `AED ${price.toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {property.title}
            </h3>
            <div className="flex items-center text-gray-600 text-sm mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{property.location}</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
              <div className="flex items-center">
                <Bed className="h-4 w-4 mr-1" />
                <span>{property.bedrooms} bed</span>
              </div>
              <div className="flex items-center">
                <Bath className="h-4 w-4 mr-1" />
                <span>{property.bathrooms} bath</span>
              </div>
            </div>
            <div className="text-lg font-bold text-primary">
              {formatPrice(property.price, property.type)}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            {property.description && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700 text-sm">{property.description}</p>
              </div>
            )}

            {property.amenities && property.amenities.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {property.images && property.images.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Images</h4>
                <div className="grid grid-cols-3 gap-2">
                  {property.images.slice(0, 6).map((image: string, index: number) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Property ${index + 1}`}
                      className="w-full h-20 object-cover rounded border"
                    />
                  ))}
                  {property.images.length > 6 && (
                    <div className="w-full h-20 bg-gray-100 rounded border flex items-center justify-center text-gray-500 text-xs">
                      +{property.images.length - 6} more
                    </div>
                  )}
                </div>
              </div>
            )}

            {property.latitude && property.longitude && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                <p className="text-gray-600 text-sm">
                  Coordinates: {property.latitude.toFixed(6)}, {property.longitude.toFixed(6)}
                </p>
              </div>
            )}

            {showActions && onEdit && onDelete && (
              <div className="flex items-center justify-end space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(property)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(property.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpandablePropertyCard;
