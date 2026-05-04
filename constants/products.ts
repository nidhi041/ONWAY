import { ImageSourcePropType } from 'react-native';

export interface Product {
  id: string;
  name: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  rating: number;
  image?: ImageSourcePropType;
  imageUrl?: string; // Firestore product image URL
  description?: string;
  stock?: number;
}

// All Products Data
export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Paracetamol 500mg',
    brand: 'GENERIC',
    price: 25,
    originalPrice: 30,
    rating: 4.8,
    image: require('@/assets/ProductImage/paracetamol.jpg'),
    description: 'Effective pain reliever and fever reducer. Pack of 10 tablets.',
    stock: 50,
  },
  {
    id: '2',
    name: 'Dettol Hand Sanitizer',
    brand: 'DETTOL',
    price: 50,
    originalPrice: 60,
    rating: 4.5,
    image: require('@/assets/ProductImage/Hand senitizer.jpg'),
    description: 'Kills 99.9% of germs without water. 50ml bottle.',
    stock: 100,
  },
  {
    id: '3',
    name: 'Vicks Vaporub',
    brand: 'VICKS',
    price: 85,
    originalPrice: 95,
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5e4b7b25e?auto=format&fit=crop&w=500&q=60',
    description: 'Relief from cold and cough symptoms.',
    stock: 30,
  },
  {
    id: '4',
    name: 'Ibuprofen 400mg',
    brand: 'BRUFEN',
    price: 40,
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=500&q=60',
    description: 'For relief from inflammatory pain.',
    stock: 200,
  },
  {
    id: '5',
    name: 'Cough Syrup',
    brand: 'BENADRYL',
    price: 120,
    originalPrice: 135,
    rating: 4.3,
    imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=500&q=60',
    description: 'Effective relief from dry cough. 150ml bottle.',
    stock: 80,
  },
  {
    id: '6',
    name: 'Vitamin C Tablets',
    brand: 'LIMCEE',
    price: 35,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=500&q=60',
    description: 'Chewable Vitamin C 500mg tablets for immunity.',
    stock: 150,
  },
  {
    id: '7',
    name: 'First Aid Bandages',
    brand: 'BAND-AID',
    price: 15,
    originalPrice: 20,
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1583324113626-70df0f4deaab?auto=format&fit=crop&w=500&q=60',
    description: 'Waterproof bandages for minor cuts and scrapes.',
    stock: 300,
  },
  {
    id: '8',
    name: 'Antacid Liquid',
    brand: 'GELUSIL',
    price: 110,
    rating: 4.2,
    imageUrl: 'https://images.unsplash.com/photo-1550572017-094e9f743ceb?auto=format&fit=crop&w=500&q=60',
    description: 'Fast relief from acidity and heartburn.',
    stock: 45,
  }
];
