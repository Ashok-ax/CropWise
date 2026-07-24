import {
  LayoutDashboard, LandPlot, Sprout, Lightbulb, Calculator, CloudSun,
  Droplets, FlaskConical, Wallet, TrendingUp, Scale, ShieldCheck,
  BookOpen, Bell, CalendarDays, Brain, Milk, Egg, Layers, Fish,
  Store, Settings, User as UserIcon, Leaf, FlaskRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  group?: string;
};

export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/app', icon: LayoutDashboard, group: 'Overview' },
  { label: "Today's Farm", href: '/app/today', icon: CalendarDays, group: 'Overview' },
  { label: 'My Farm', href: '/app/farm', icon: LandPlot, group: 'Farm' },
  { label: 'Land & Soil', href: '/app/soil', icon: Leaf, group: 'Farm' },
  { label: 'Crops', href: '/app/crops', icon: Sprout, group: 'Farm' },
  { label: 'Recommendations', href: '/app/recommendations', icon: Lightbulb, group: 'Plan' },
  { label: 'Crop Predictor (AI)', href: '/app/predict-crop', icon: FlaskRound, group: 'Plan' },
  { label: 'Farm Simulator', href: '/app/simulator', icon: Calculator, group: 'Plan' },
  { label: 'Weather', href: '/app/weather', icon: CloudSun, group: 'Plan' },
  { label: 'Irrigation', href: '/app/irrigation', icon: Droplets, group: 'Plan' },
  { label: 'Fertilizer Guide', href: '/app/fertilizer', icon: FlaskConical, group: 'Plan' },
  { label: 'Expenses', href: '/app/expenses', icon: Wallet, group: 'Finance' },
  { label: 'Revenue', href: '/app/revenue', icon: TrendingUp, group: 'Finance' },
  { label: 'Profit & Loss', href: '/app/profit-loss', icon: Scale, group: 'Finance' },
  { label: 'Govt. Schemes', href: '/app/schemes', icon: ShieldCheck, group: 'Resources' },
  { label: 'Knowledge Center', href: '/app/knowledge', icon: BookOpen, group: 'Resources' },
  { label: 'Reminders', href: '/app/reminders', icon: Bell, group: 'Resources' },
  { label: 'CropWise AI', href: '/app/ai', icon: Brain, group: 'Assistant' },
  { label: 'Dairy', href: '/app/dairy', icon: Milk, group: 'Activities' },
  { label: 'Poultry', href: '/app/poultry', icon: Egg, group: 'Activities' },
  { label: 'Livestock', href: '/app/livestock', icon: Layers, group: 'Activities' },
  { label: 'Fisheries', href: '/app/fisheries', icon: Fish, group: 'Activities' },
  { label: 'Marketplace', href: '/app/marketplace', icon: Store, group: 'More' },
  { label: 'Profile', href: '/app/profile', icon: UserIcon, group: 'More' },
  { label: 'Settings', href: '/app/settings', icon: Settings, group: 'More' },
];
