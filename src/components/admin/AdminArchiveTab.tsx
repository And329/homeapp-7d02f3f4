import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Archive, ArchiveRestore, Edit, Trash2, MapPin, Calendar, Home, Car } from 'lucide-react';
import { useUnits } from '@/contexts/UnitsContext';

interface AdminProperty {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number | null;
  type: 'rent' | 'sale';
  is_hot_deal: boolean;
  description: string;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
  amenities: string[] | null;
  images: string[] | null;
  emirate: string;
  property_type: string;
  year_built: number | null;
  parking: number | null;
  qr_code: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  admin_notes: string;
  owner_id?: string;
  is_approved: boolean;
  is_archived: boolean;
}

interface AdminArchiveTabProps {
  archivedProperties: AdminProperty[];
  propertiesLoading: boolean;
  onEditProperty: (property: AdminProperty) => void;
  onDeleteProperty: (id: string) => void;
  onUnarchiveProperty: (id: string) => void;
}

const AdminArchiveTab: React.FC<AdminArchiveTabProps> = ({
  archivedProperties,
  propertiesLoading,
  onEditProperty,
  onDeleteProperty,
  onUnarchiveProperty,
}) => {
  const { currency } = useUnits();

  const formatCurrency = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formatter.format(amount);
  };

  if (propertiesLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Archived Properties</h2>
        </div>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Archived Properties ({archivedProperties.length})</h2>
      </div>

      {archivedProperties.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Archived Properties</h3>
            <p className="text-gray-500">Archived properties will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {archivedProperties.map((property) => (
            <Card key={property.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{property.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {property.location}, {property.emirate}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(property.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">
                        {formatCurrency(property.price, currency)}
                      </div>
                      <Badge variant={property.type === 'sale' ? 'default' : 'secondary'}>
                        {property.type === 'sale' ? 'For Sale' : 'For Rent'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <Home className="h-4 w-4 mr-1 text-gray-400" />
                      {property.bedrooms} bed, {property.bathrooms} bath
                    </div>
                    {property.area && (
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-1">📐</span>
                        {property.area} sq ft
                      </div>
                    )}
                    {property.parking && (
                      <div className="flex items-center">
                        <Car className="h-4 w-4 mr-1 text-gray-400" />
                        {property.parking} parking
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUnarchiveProperty(property.id)}
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      <ArchiveRestore className="h-4 w-4 mr-1" />
                      Unarchive
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditProperty(property)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteProperty(property.id)}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
                {property.description && (
                  <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                    {property.description}
                  </p>
                )}
                {property.admin_notes && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                      <strong>Admin Notes:</strong> {property.admin_notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminArchiveTab;