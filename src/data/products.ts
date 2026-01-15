import kitchenOrgImage from "@/assets/product-kitchen-org.jpg";
import mealPrepImage from "@/assets/product-meal-prep.jpg";
import cleaningImage from "@/assets/product-cleaning.jpg";
import bedroomImage from "@/assets/product-bedroom.jpg";

export type Category = "all" | "kitchen" | "cleaning" | "bedroom";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  creator: string;
  creatorAvatar: string;
  rating: number;
  downloads: number;
  featured?: boolean;
}

export interface Creator {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  products: number;
  sales: number;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Ultimate Kitchen Organization Guide",
    description: "Transform your kitchen with 50+ organization tips, printable labels, and storage solutions.",
    price: 12.99,
    category: "kitchen",
    image: kitchenOrgImage,
    creator: "HomeStyle Pro",
    creatorAvatar: "/placeholder.svg",
    rating: 4.9,
    downloads: 2340,
    featured: true,
  },
  {
    id: "2",
    name: "Meal Prep Planner Bundle",
    description: "Weekly meal planners, grocery lists, and 100+ recipe cards for efficient cooking.",
    price: 19.99,
    category: "kitchen",
    image: mealPrepImage,
    creator: "Chef Maria",
    creatorAvatar: "/placeholder.svg",
    rating: 4.8,
    downloads: 1890,
  },
  {
    id: "3",
    name: "Deep Clean Checklist System",
    description: "Room-by-room cleaning schedules, checklists, and natural cleaning recipes.",
    price: 8.99,
    category: "cleaning",
    image: cleaningImage,
    creator: "Clean Living Co",
    creatorAvatar: "/placeholder.svg",
    rating: 4.7,
    downloads: 3210,
    featured: true,
  },
  {
    id: "4",
    name: "Eco-Friendly Cleaning Guide",
    description: "DIY natural cleaning products, zero-waste tips, and sustainable home care.",
    price: 14.99,
    category: "cleaning",
    image: cleaningImage,
    creator: "Green Home",
    creatorAvatar: "/placeholder.svg",
    rating: 4.9,
    downloads: 1567,
  },
  {
    id: "5",
    name: "Bedroom Sanctuary Blueprint",
    description: "Sleep optimization guide, bedroom layout templates, and relaxation techniques.",
    price: 16.99,
    category: "bedroom",
    image: bedroomImage,
    creator: "Rest & Renew",
    creatorAvatar: "/placeholder.svg",
    rating: 4.8,
    downloads: 987,
  },
  {
    id: "6",
    name: "Closet Organization Masterclass",
    description: "Wardrobe organization system, seasonal rotation guides, and capsule wardrobe templates.",
    price: 22.99,
    category: "bedroom",
    image: bedroomImage,
    creator: "Style Sorted",
    creatorAvatar: "/placeholder.svg",
    rating: 4.6,
    downloads: 2100,
    featured: true,
  },
  {
    id: "7",
    name: "Smart Kitchen Gadget Guide",
    description: "Reviews and how-to guides for modern kitchen tools and appliances.",
    price: 9.99,
    category: "kitchen",
    image: kitchenOrgImage,
    creator: "Tech Kitchen",
    creatorAvatar: "/placeholder.svg",
    rating: 4.5,
    downloads: 1234,
  },
  {
    id: "8",
    name: "Laundry Room Revolution",
    description: "Stain removal guide, fabric care tips, and laundry room organization hacks.",
    price: 11.99,
    category: "cleaning",
    image: cleaningImage,
    creator: "Clean Living Co",
    creatorAvatar: "/placeholder.svg",
    rating: 4.7,
    downloads: 1876,
  },
];

export const creators: Creator[] = [
  {
    id: "1",
    name: "HomeStyle Pro",
    avatar: "/placeholder.svg",
    bio: "Professional home organizer with 10+ years experience",
    products: 24,
    sales: 12500,
  },
  {
    id: "2",
    name: "Chef Maria",
    avatar: "/placeholder.svg",
    bio: "Culinary expert and meal prep specialist",
    products: 18,
    sales: 8900,
  },
  {
    id: "3",
    name: "Clean Living Co",
    avatar: "/placeholder.svg",
    bio: "Sustainable cleaning solutions for modern homes",
    products: 31,
    sales: 15200,
  },
  {
    id: "4",
    name: "Rest & Renew",
    avatar: "/placeholder.svg",
    bio: "Sleep consultant and bedroom design expert",
    products: 12,
    sales: 5600,
  },
];

export const categories = [
  { id: "all", name: "All Products", icon: "Grid3X3" },
  { id: "kitchen", name: "Kitchen Items", icon: "ChefHat" },
  { id: "cleaning", name: "Cleaning Supplies", icon: "Sparkles" },
  { id: "bedroom", name: "Bedroom Items", icon: "Bed" },
] as const;
