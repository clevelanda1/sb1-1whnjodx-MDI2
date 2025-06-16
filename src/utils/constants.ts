import { Testimonial, RoomInspiration, Brand, ProcessStep, Product, Store, DetectedElement } from '../types';
{/*import { Upload, Monitor, Cart } from 'lucide-react';*/}
import { Upload, Fullscreen, Cart } from 'react-bootstrap-icons';

export const APP_NAME = 'MDI';
export const APP_TAGLINE = 'Curated Design Intelligence';

export const PROCESS_STEPS: ProcessStep[] = [
  {
    id: 1,
    title: 'Upload',
    description: 'Share any interior design image that inspires you - from social media, online, or your own gallery of photos.',
    icon: 'Upload',
  },
  {
    id: 2,
    title: 'Analyze',
    description: 'Design Core instantly identifies furniture and  decor elements in your inspiration image.',
    icon: 'Search',
  },
  {
    id: 3,
    title: 'Shop',
    description: 'Receive instant product recommendations with products, prices, and direct links to buy what you love.',
    icon: 'Cart',
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    quote: "Atelier has transformed how I approach new client projects. The curated inspirations save me countless hours of research.",
    author: 'Jean-Michel Laurent',
    title: 'Principal Designer, Laurent & Associates',
    image: 'https://images.pexels.com/photos/5615665/pexels-photo-5615665.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
  {
    id: 2,
    quote: "The level of sophistication in Atelier's recommendations is unmatched. It's like having a design partner who truly understands luxury.",
    author: 'Sophia Richardson',
    title: 'Creative Director, Maison Richardson',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
  {
    id: 3,
    quote: "My clients are consistently impressed with the concepts I develop using Atelier's intelligence platform.",
    author: 'Marcus Chen',
    title: 'Founder, Harmonious Spaces',
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
];

export const FEATURED_ROOMS: RoomInspiration[] = [
  {
    id: 1,
    title: 'Modern Parisian Living',
    description: 'Blend of modern minimalism with classic Parisian elegance',
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Living Room',
    featured: true,
  },
  {
    id: 2,
    title: 'Nordic Serenity Suite',
    description: 'Peaceful master bedroom with Scandinavian design principles',
    image: 'https://images.pexels.com/photos/1648768/pexels-photo-1648768.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Bedroom',
    featured: true,
  },
  {
    id: 3,
    title: 'Modernist Culinary Space',
    description: 'High-function kitchen with architectural precision',
    image: 'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Kitchen',
    featured: true,
  },
  {
    id: 4,
    title: 'Biophilic Urban Retreat',
    description: 'Nature-integrated living space for city dwellers',
    image: 'https://images.pexels.com/photos/6527069/pexels-photo-6527069.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Living Room',
    featured: false,
  },
  {
    id: 5,
    title: 'Artisanal Study Sanctuary',
    description: 'Thoughtfully crafted home office with bespoke details',
    image: 'https://images.pexels.com/photos/1957477/pexels-photo-1957477.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Office',
    featured: true,
  },
];

export const LUXURY_BRANDS: Brand[] = [
  {
    id: 1,
    name: 'Eichholtz',
    logo: 'https://images.pexels.com/photos/5816294/pexels-photo-5816294.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
  {
    id: 2,
    name: 'Roche Bobois',
    logo: 'https://images.pexels.com/photos/6492403/pexels-photo-6492403.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
  {
    id: 3,
    name: 'Fendi Casa',
    logo: 'https://images.pexels.com/photos/7319307/pexels-photo-7319307.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
  {
    id: 4,
    name: 'Christopher Guy',
    logo: 'https://images.pexels.com/photos/6489663/pexels-photo-6489663.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
  {
    id: 5,
    name: 'Restoration Hardware',
    logo: 'https://images.pexels.com/photos/4207788/pexels-photo-4207788.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
];

export const LUXURY_STORES: Store[] = [
  { id: 1, name: 'Restoration Hardware', accent: '#8B7355' },
  { id: 2, name: 'West Elm', accent: '#2C5282' },
  { id: 3, name: 'CB2', accent: '#1A202C' },
  { id: 4, name: 'Design Within Reach', accent: '#744210' },
  { id: 5, name: 'Crate & Barrel', accent: '#2D3748' },
];

export const CURATED_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Cloud Modular Sectional',
    description: 'Luxurious modular seating with deep cushions and elegant proportions',
    price: 4895,
    category: 'Seating',
    store: LUXURY_STORES[0],
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
    style: 'Modern'
  },
  {
    id: 2,
    name: 'Brass Orbital Chandelier',
    description: 'Contemporary lighting fixture with adjustable glass orbs',
    price: 2299,
    category: 'Lighting',
    store: LUXURY_STORES[1],
    image: 'https://images.pexels.com/photos/1648768/pexels-photo-1648768.jpeg',
    style: 'Contemporary'
  },
  {
    id: 3,
    name: 'Marble Console Table',
    description: 'Minimalist console with Carrara marble top and brass frame',
    price: 1899,
    category: 'Tables',
    store: LUXURY_STORES[2],
    image: 'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg',
    style: 'Minimalist'
  },
  {
    id: 4,
    name: 'Velvet Lounge Chair',
    description: 'Mid-century inspired chair with premium velvet upholstery',
    price: 2495,
    category: 'Seating',
    store: LUXURY_STORES[3],
    image: 'https://images.pexels.com/photos/6527069/pexels-photo-6527069.jpeg',
    style: 'Mid-Century'
  },
  {
    id: 5,
    name: 'Abstract Area Rug',
    description: 'Hand-knotted wool rug with contemporary pattern',
    price: 3295,
    category: 'Textiles',
    store: LUXURY_STORES[4],
    image: 'https://images.pexels.com/photos/1957477/pexels-photo-1957477.jpeg',
    style: 'Contemporary'
  },
];

export const STYLE_CATEGORIES = [
  'Modern',
  'Contemporary',
  'Traditional',
  'Mid-Century',
  'Minimalist',
  'Industrial',
  'Scandinavian',
  'Transitional'
];

export const PRICE_RANGES = [
  { label: 'Under $100', min: 0, max: 100 },
  { label: '$100 - $250', min: 100, max: 250 },
  { label: '$250 - $500', min: 250, max: 500 },
  { label: '$500 - $1,000', min: 500, max: 1000 },
  { label: '$1,000 - $2,500', min: 1000, max: 2500 },
  { label: '$2,500+', min: 2500, max: Infinity }
];

export const SEARCH_QUERIES: Record<string, string[]> = {
  'Round Mirror': [
    'Large round wooden framed mirror',
    'Modern circular wall mirror with gold frame',
    'Rustic round mirror with natural wood frame',
    'Contemporary oversized round mirror',
    'Vintage-style round decorative mirror'
  ],
  'Wooden Bench': [
    'Natural wood entryway bench',
    'Rustic wooden dining bench',
    'Modern live-edge wood bench',
    'Scandinavian style wooden bench',
    'Industrial wood and metal bench'
  ],
  'Decorative Plant': [
    'Large indoor fiddle leaf fig tree',
    'Modern ceramic planter with tropical plant',
    'Artificial monstera plant in designer pot',
    'Contemporary potted palm tree',
    'Minimalist snake plant arrangement'
  ],
  'Throw Pillows': [
    'Luxury textured throw pillows set',
    'Designer accent pillows in neutral tones',
    'Modern geometric pattern cushions',
    'Handwoven decorative pillow collection',
    'Premium velvet throw pillows'
  ],
  'Coffee Table Books': [
    'Curated collection of design books',
    'Luxury fashion coffee table books',
    'Architecture and interior design books',
    'Contemporary art book collection',
    'Premium photography books'
  ],
  'Woven Basket': [
    'Handwoven storage basket with lid',
    'Natural fiber decorative basket',
    'Modern woven basket set',
    'Artisanal seagrass basket',
    'Designer storage basket collection'
  ],
  'Area Rug': [
    'Hand-knotted wool geometric rug',
    'Modern abstract area rug',
    'Vintage-inspired wool blend rug',
    'Contemporary neutral area rug',
    'Designer Persian-style rug'
  ],
  'Wall Paint': [
    'Premium matte wall paint in neutral tone',
    'Designer interior paint collection',
    'Modern wall color palette',
    'Luxury eco-friendly wall paint',
    'Contemporary paint finish'
  ],
  'Coat Rack': [
    'Modern wall-mounted coat rack',
    'Minimalist entryway coat stand',
    'Designer metal coat hooks',
    'Contemporary wooden coat rack',
    'Industrial style coat storage'
  ]
};