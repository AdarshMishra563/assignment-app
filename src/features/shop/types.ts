import { Dosha } from '../../shared/patientProfile/patientProfileSlice';

export interface Product {
  id: string;
  name: string;
  nameHi?: string;
  sanskritName?: string;
  shastraReference?: string;
  subtitle: string;
  category: string;
  price: number;
  originalPrice: number;
  rating: number;
  ratingCount: number;
  image: string;
  images: string[];
  description: string;
  ingredients: string[];
  keyBenefits: string[];
  recommendedForDosha: Dosha[];
  allergyTags: string[]; // checked against patient allergy records
  isBestSeller?: boolean;
  isCertified?: boolean;
  certificationMarks?: string[];
  inStock: boolean;
  stockCount: number;
  dosageInstructions: string;
  anupanaCarrier?: string;
  ayurvedicPharmacology?: {
    rasa?: string; // Taste
    guna?: string; // Quality
    virya?: string; // Potency (Sheeta / Ushna)
    vipaka?: string; // Post-digestive effect
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export interface Coupon {
  code: string;
  discountPercentage: number;
  maxDiscount: number;
  minOrder: number;
}
