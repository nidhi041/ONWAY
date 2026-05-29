import { ImageSourcePropType } from 'react-native';

export interface Product {
  id: string;
  name: string;
  brand?: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews?: number;
  deliveryTime?: number;
  image?: ImageSourcePropType;
  imageUrl?: string;
  description?: string;
  warranty?: string | null;
  returnDays?: number;
  stock?: number;
}


