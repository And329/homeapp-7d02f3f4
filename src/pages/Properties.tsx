
import React, { useState, useEffect } from 'react';
import { ChevronDown, MapPin, Bed, Bath, DollarSign, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PropertyCard from '../components/PropertyCard';
import PropertyMap from '../components/PropertyMap';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { transformDatabaseProperty } from '@/utils/propertyTransform';
import { Property } from '@/types/property';
import { PropertyRequest } from '@/types/propertyRequest';

const Properties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [userRequests, setUserRequests] = useState<PropertyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    location: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showUserListings, setShowUserListings] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*');

        if (error) throw error;

        const transformedProperties = data?.map(transformDatabaseProperty) || [];
        setProperties(transformedProperties);
      } catch (error) {
        console.error('Error fetching properties:', error);
        toast({
          title: "Error",
          description: "Failed to load properties.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [toast]);

  useEffect(() => {
    if (user && showUserListings) {
      fetchUserRequests();
    }
  }, [user, showUserListings]);

  const fetchUserRequests = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('property_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match PropertyRequest interface
      const transformedRequests: PropertyRequest[] = (data || []).map(request => {
        // Safely parse images
        let images: string[] = [];
        if (request.images) {
          if (Array.isArray(request.images)) {
            images = request.images.filter((img): img is string => typeof img === 'string');
          }
        }

        // Safely parse videos
        let videos: string[] = [];
        if (request.videos && Array.isArray(request.videos)) {
          videos = request.videos.filter((video): video is string => typeof video === 'string');
        }

        // Safely parse amenities
        let amenities: string[] | null = null;
        if (request.amenities) {
          if (Array.isArray(request.amenities)) {
            amenities = request.amenities.filter((amenity): amenity is string => typeof amenity === 'string');
          }
        }

        // Ensure type is properly typed
        const type = (request.type === 'rent' || request.type === 'sale') ? request.type : 'rent';

        return {
          id: request.id,
          user_id: request.user_id || '',
          title: request.title,
          description: request.description,
          price: request.price,
          location: request.location,
          latitude: request.latitude,
          longitude: request.longitude,
          bedrooms: request.bedrooms,
          bathrooms: request.bathrooms,
          type: type as 'rent' | 'sale',
          property_type: request.property_type,
          amenities: amenities,
          images: images,
          videos: videos,
          contact_name: request.contact_name,
          contact_email: request.contact_email,
          contact_phone: request.contact_phone,
          status: request.status || 'pending',
          created_at: request.created_at,
          updated_at: request.updated_at,
          approved_by: request.approved_by,
          approved_at: request.approved_at,
        } as PropertyRequest;
      });
      
      setUserRequests(transformedRequests);
    } catch (error) {
      console.error('Error fetching user requests:', error);
      toast({
        title: "Error",
        description: "Failed to load your listings.",
        variant: "destructive",
      });
    }
  };

  const deletePropertyRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('property_requests')
        .delete()
        .eq('id', requestId)
        .eq('user_id', user?.id); // Ensure user can only delete their own requests

      if (error) throw error;

      setUserRequests(prev => prev.filter(req => req.id !== requestId));
      toast({
        title: "Listing deleted",
        description: "Your property listing has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting property request:', error);
      toast({
        title: "Error",
        description: "Failed to delete listing. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredProperties = properties.filter((property) => {
    const matchesType = !filters.type || property.type === filters.type;
    const matchesMinPrice = !filters.minPrice || property.price >= parseInt(filters.minPrice);
    const matchesMaxPrice = !filters.maxPrice || property.price <= parseInt(filters.maxPrice);
    const matchesBedrooms = !filters.bedrooms || property.bedrooms === parseInt(filters.bedrooms);
    const matchesLocation = !filters.location || 
      property.location.toLowerCase().includes(filters.location.toLowerCase());

    return matchesType && matchesMinPrice && matchesMaxPrice && matchesBedrooms && matchesLocation;
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      location: '',
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Transform properties for map display
  const mapProperties = filteredProperties.map(property => ({
    id: parseInt(property.id),
    title: property.title,
    location: property.location,
    price: property.price,
    type: property.type as 'rent' | 'sale',
    latitude: property.coordinates.lat,
    longitude: property.coordinates.lng,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <section className="uae-gradient text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Properties</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Discover the perfect property in Dubai's most sought-after locations.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ChevronDown className={`h-4 w-4 mr-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              Filters
            </Button>
            <Button
              onClick={() => setShowMap(!showMap)}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <MapPin className="h-4 w-4 mr-2" />
              {showMap ? 'Hide Map' : 'Show Map'}
            </Button>
            {user && (
              <Button
                onClick={() => setShowUserListings(!showUserListings)}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {showUserListings ? 'Hide My Listings' : 'My Listings'}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Filters */}
      {showFilters && (
        <section className="bg-white border-b py-6">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="">All Types</option>
                <option value="rent">For Rent</option>
                <option value="sale">For Sale</option>
              </select>

              <input
                type="number"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              />

              <input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              />

              <select
                value={filters.bedrooms}
                onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="">Any Bedrooms</option>
                <option value="1">1 Bedroom</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3 Bedrooms</option>
                <option value="4">4+ Bedrooms</option>
              </select>

              <input
                type="text"
                placeholder="Location"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              />

              <Button onClick={clearFilters} variant="outline">
                Clear All
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Map */}
      {showMap && (
        <section className="h-96">
          <PropertyMap 
            properties={mapProperties} 
            enableNavigation={true}
          />
        </section>
      )}

      {/* User Listings */}
      {showUserListings && user && (
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">My Property Listings</h2>
            {userRequests.length === 0 ? (
              <p className="text-gray-600">You haven't submitted any property listings yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userRequests.map((request) => (
                  <div key={request.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    {request.images && request.images.length > 0 && (
                      <img
                        src={request.images[0]}
                        alt={request.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{request.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{request.location}</span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-primary font-bold">
                          <DollarSign className="h-4 w-4" />
                          <span>{request.price.toLocaleString()} AED</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Bed className="h-4 w-4 mr-1" />
                            <span>{request.bedrooms}</span>
                          </div>
                          <div className="flex items-center">
                            <Bath className="h-4 w-4 mr-1" />
                            <span>{request.bathrooms}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                        <Button
                          onClick={() => deletePropertyRequest(request.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Properties Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredProperties.length} Properties Found
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No properties found</h3>
              <p className="text-gray-500">Try adjusting your filters to see more results.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Properties;
