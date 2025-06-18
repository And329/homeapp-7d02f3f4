
export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  images: string[];
  type: 'rent' | 'sale';
  isHotDeal?: boolean;
  description: string;
  amenities: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  propertyType: string;
  yearBuilt?: number;
  parking?: number;
}

export const properties: Property[] = [
  {
    id: '1',
    title: 'Luxury Villa in Dubai Marina',
    price: 350000,
    location: 'Dubai Marina, Dubai',
    bedrooms: 4,
    bathrooms: 5,
    area: 3500,
    image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1492321936769-b49830bc1d1e?w=800&h=600&fit=crop'
    ],
    type: 'sale',
    isHotDeal: true,
    description: 'Stunning luxury villa with panoramic views of Dubai Marina. This exceptional property features modern architecture, premium finishes, and world-class amenities.',
    amenities: ['Swimming Pool', 'Gym', '24/7 Security', 'Parking', 'Balcony', 'Marina View', 'Concierge Service'],
    coordinates: { lat: 25.0772, lng: 55.1395 },
    propertyType: 'Villa',
    yearBuilt: 2020,
    parking: 3
  },
  {
    id: '2',
    title: 'Modern Apartment in Downtown Dubai',
    price: 8500,
    location: 'Downtown Dubai, Dubai',
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop'
    ],
    type: 'rent',
    isHotDeal: true,
    description: 'Contemporary 2-bedroom apartment in the heart of Downtown Dubai with breathtaking city views and access to world-class amenities.',
    amenities: ['Swimming Pool', 'Gym', 'Parking', 'Balcony', 'City View', 'Metro Access'],
    coordinates: { lat: 25.1972, lng: 55.2744 },
    propertyType: 'Apartment',
    yearBuilt: 2018,
    parking: 1
  },
  {
    id: '3',
    title: 'Beachfront Penthouse in JBR',
    price: 750000,
    location: 'Jumeirah Beach Residence, Dubai',
    bedrooms: 3,
    bathrooms: 4,
    area: 2800,
    image: 'https://images.unsplash.com/photo-1492321936769-b49830bc1d1e?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1492321936769-b49830bc1d1e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop'
    ],
    type: 'sale',
    description: 'Exclusive beachfront penthouse with direct beach access and unobstructed sea views. Features premium finishes and private terrace.',
    amenities: ['Beach Access', 'Swimming Pool', 'Gym', 'Spa', 'Parking', 'Terrace', 'Sea View'],
    coordinates: { lat: 25.0778, lng: 55.1236 },
    propertyType: 'Penthouse',
    yearBuilt: 2019,
    parking: 2
  },
  {
    id: '4',
    title: 'Family Villa in Arabian Ranches',
    price: 12000,
    location: 'Arabian Ranches, Dubai',
    bedrooms: 5,
    bathrooms: 6,
    area: 4200,
    image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop'
    ],
    type: 'rent',
    description: 'Spacious family villa in a prestigious gated community with golf course views and premium amenities for families.',
    amenities: ['Private Garden', 'Swimming Pool', 'Gym', 'Golf Course View', 'Parking', 'Study Room', 'Maid Room'],
    coordinates: { lat: 25.0542, lng: 55.2139 },
    propertyType: 'Villa',
    yearBuilt: 2017,
    parking: 4
  },
  {
    id: '5',
    title: 'Studio Apartment in Business Bay',
    price: 4200,
    location: 'Business Bay, Dubai',
    bedrooms: 0,
    bathrooms: 1,
    area: 650,
    image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop'
    ],
    type: 'rent',
    isHotDeal: true,
    description: 'Modern studio apartment perfect for young professionals, located in the bustling Business Bay district.',
    amenities: ['Swimming Pool', 'Gym', 'Parking', 'Balcony', 'Metro Access', '24/7 Security'],
    coordinates: { lat: 25.1889, lng: 55.2631 },
    propertyType: 'Studio',
    yearBuilt: 2019,
    parking: 1
  },
  {
    id: '6',
    title: 'Luxury Townhouse in Damac Hills',
    price: 425000,
    location: 'Damac Hills, Dubai',
    bedrooms: 3,
    bathrooms: 4,
    area: 2200,
    image: 'https://images.unsplash.com/photo-1492321936769-b49830bc1d1e?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1492321936769-b49830bc1d1e?w=800&h=600&fit=crop'
    ],
    type: 'sale',
    description: 'Contemporary townhouse in a family-friendly community with golf course access and premium amenities.',
    amenities: ['Private Garden', 'Golf Course Access', 'Swimming Pool', 'Gym', 'Parking', 'Community Center'],
    coordinates: { lat: 25.0331, lng: 55.1961 },
    propertyType: 'Townhouse',
    yearBuilt: 2020,
    parking: 2
  }
];

export const getPropertyById = (id: string): Property | undefined => {
  return properties.find(property => property.id === id);
};

export const getPropertiesByType = (type: 'rent' | 'sale'): Property[] => {
  return properties.filter(property => property.type === type);
};

export const getHotDeals = (): Property[] => {
  return properties.filter(property => property.isHotDeal);
};
