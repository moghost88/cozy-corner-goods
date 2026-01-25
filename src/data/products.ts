import kitchenOrgImage from "@/assets/product-kitchen-org.jpg";
import mealPrepImage from "@/assets/product-meal-prep.jpg";
import cleaningImage from "@/assets/product-cleaning.jpg";
import bedroomImage from "@/assets/product-bedroom.jpg";

export type Category = "all" | "kitchen-tools" | "home-decor" | "cleaning-supplies";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  subcategory?: string;
  image: string;
  creator: string;
  creatorAvatar: string;
  rating: number;
  downloads: number;
  featured?: boolean;
  date: string;
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
    name: "Professional Kitchen Set",
    description: "High-quality stainless steel kitchen tools for everyday cooking.",
    price: 45.99,
    category: "kitchen-tools",
    subcategory: "cutlery-sets",
    image: kitchenOrgImage,
    creator: "Chef Essentials",
    creatorAvatar: "/placeholder.svg",
    rating: 4.8,
    downloads: 1200,
    featured: true,
    date: "2024-01-15T10:00:00Z"
  },
  {
    id: "2",
    name: "Insulated Water Bottle",
    description: "Keep your drinks cold for 24 hours with our premium water bottle.",
    price: 24.99,
    category: "kitchen-tools",
    subcategory: "water-bottles",
    image: mealPrepImage,
    creator: "EcoGear",
    creatorAvatar: "/placeholder.svg",
    rating: 4.9,
    downloads: 850,
    date: "2024-01-20T14:30:00Z"
  },
  {
    id: "3",
    name: "Smart Food Blender",
    description: "High-speed blender with multiple presets for smoothies and soups.",
    price: 89.99,
    category: "kitchen-tools",
    subcategory: "blenders",
    image: cleaningImage,
    creator: "TechKitchen",
    creatorAvatar: "/placeholder.svg",
    rating: 4.7,
    downloads: 450,
    featured: true,
    date: "2023-12-10T09:15:00Z"
  },
  {
    id: "4",
    name: "Minimalist Wall Clock",
    description: "Elegant wooden wall clock for modern home decor.",
    price: 34.99,
    category: "home-decor",
    image: bedroomImage,
    creator: "DesignCo",
    creatorAvatar: "/placeholder.svg",
    rating: 4.6,
    downloads: 320,
    date: "2024-02-01T16:45:00Z"
  },
  {
    id: "5",
    name: "Eco Cleaning Kit",
    description: "Complete set of non-toxic cleaning supplies for your home.",
    price: 29.99,
    category: "cleaning-supplies",
    image: cleaningImage,
    creator: "GreenPure",
    creatorAvatar: "/placeholder.svg",
    rating: 4.8,
    downloads: 670,
    date: "2024-01-05T11:20:00Z"
  },
  {
    id: "6",
    name: "Premium Chef Knife",
    description: "Forged Japanese steel knife for precise cutting.",
    price: 59.99,
    category: "kitchen-tools",
    subcategory: "knives",
    image: kitchenOrgImage,
    creator: "MasterCut",
    creatorAvatar: "/placeholder.svg",
    rating: 4.9,
    downloads: 210,
    date: "2024-02-15T13:00:00Z"
  }
];

export const creators: Creator[] = [
  {
    id: "1",
    name: "Chef Essentials",
    avatar: "/placeholder.svg",
    bio: "Premium kitchenware for modern homes",
    products: 15,
    sales: 5400,
  },
  {
    id: "2",
    name: "DesignCo",
    avatar: "/placeholder.svg",
    bio: "Minimalist home decor specialists",
    products: 22,
    sales: 3200,
  },
  {
    id: "3",
    name: "GreenPure",
    avatar: "/placeholder.svg",
    bio: "Sustainable cleaning solutions",
    products: 10,
    sales: 1800,
  }
];

export const categories = [
  { id: "all", name: "All Products", icon: "Grid3X3" },
  {
    id: "kitchen-tools",
    name: "Kitchen Tools",
    icon: "ChefHat",
    subcategories: [
      { id: "water-bottles", name: "Water Bottles" },
      { id: "spoons", name: "Spoons" },
      { id: "forks", name: "Forks" },
      { id: "knives", name: "Knives" },
      { id: "cutlery-sets", name: "Cutlery Sets" },
      { id: "lunch-boxes", name: "Lunch Boxes" },
      { id: "blenders", name: "Blenders" },
      { id: "hand-blenders", name: "Hand Blenders" }
    ]
  },
  { id: "home-decor", name: "Home Décor", icon: "Home" },
  { id: "cleaning-supplies", name: "Cleaning Supplies", icon: "Sparkles" },
] as const;
