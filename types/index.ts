export interface Property {
    id: number;
    title: string;
    description?: string;
    price: number;
    type: string;
    bedrooms: number;
    bathrooms: number;
    area_sqft: number;
    address?: string;
    city?: string;
    latitude: number;
    longitude: number;
    images?: string[];
    features?: string[];
    is_active: boolean;
    is_featured: boolean;
    is_sold: boolean;
    created_at?: string;
}
