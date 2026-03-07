export interface NavItem {
  label: string;
  href: string;
  dropdown?: NavItem[];
}

export interface Feature {
  id: number;
  icon: string;
  title: string;
  description: string;
}

export interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
  avatar?: string;
}

export interface LoanProduct {
  id: number;
  title: string;
  description: string;
  features: string[];
  progress: number;
}