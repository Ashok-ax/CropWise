export type Profile = {
  id: string;
  full_name: string;
  age: number | null;
  phone: string | null;
  preferred_language: string;
  location: string | null;
  farming_types: string[];
  experience: string | null;
  primary_activity: string | null;
  secondary_activities: string[];
  budget: number | null;
  investment_capacity: number | null;
  onboarding_completed: boolean;
  role: 'farmer' | 'admin';
  created_at: string;
  updated_at: string;
};

export type Farm = {
  id: string;
  user_id: string;
  name: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  land_area: number | null;
  area_unit: string;
  soil_type: string | null;
  water_availability: string | null;
  irrigation_type: string | null;
  created_at: string;
  updated_at: string;
};

export type SoilProfile = {
  id: string;
  farm_id: string;
  ph: number | null;
  nitrogen: number | null;
  phosphorus: number | null;
  potassium: number | null;
  organic_matter: number | null;
  moisture: string | null;
  drainage: string | null;
  test_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CropRecord = {
  id: string;
  farm_id: string;
  crop_name: string;
  variety: string | null;
  area: number | null;
  area_unit: string;
  planting_date: string | null;
  expected_harvest_date: string | null;
  growth_stage: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Expense = {
  id: string;
  farm_id: string;
  user_id: string;
  category: string;
  amount: number;
  expense_date: string;
  crop_id: string | null;
  activity_type: string | null;
  description: string | null;
  created_at: string;
};

export type Revenue = {
  id: string;
  farm_id: string;
  user_id: string;
  category: string;
  amount: number;
  revenue_date: string;
  crop_id: string | null;
  activity_type: string | null;
  description: string | null;
  created_at: string;
};

export type Reminder = {
  id: string;
  user_id: string;
  title: string;
  reminder_type: string;
  due_date: string;
  status: string;
  notes: string | null;
  created_at: string;
};

export type Livestock = {
  id: string;
  farm_id: string;
  animal_id: string | null;
  species: string;
  breed: string | null;
  gender: string | null;
  birth_date: string | null;
  acquisition_date: string | null;
  weight: number | null;
  health_status: string;
  vaccination_status: string | null;
  last_vaccination_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Poultry = {
  id: string;
  farm_id: string;
  batch_id: string | null;
  breed: string;
  bird_count: number;
  purpose: string | null;
  feed_type: string | null;
  feed_amount: number | null;
  vaccination_status: string | null;
  egg_production: number | null;
  mortality_count: number;
  acquisition_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type DairyRecord = {
  id: string;
  farm_id: string;
  livestock_id: string | null;
  record_date: string;
  morning_milk_litres: number;
  evening_milk_litres: number;
  fat_content: number | null;
  notes: string | null;
  created_at: string;
};

export type Fishery = {
  id: string;
  farm_id: string;
  pond_id: string | null;
  fish_species: string;
  stock_count: number;
  feed_type: string | null;
  feed_amount: number | null;
  water_quality_ph: number | null;
  water_temperature: number | null;
  oxygen_level: number | null;
  stocking_date: string | null;
  expected_harvest_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AIConversation = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export type AIMessage = {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  farm_context: Record<string, unknown> | null;
  created_at: string;
};

export type CropCatalog = {
  id: string;
  crop_name: string;
  category: string;
  water_requirement: string;
  growing_period_days: number;
  suitable_seasons: string[];
  suitable_soil_types: string[];
  estimated_investment_per_acre: number | null;
  estimated_revenue_per_acre: number | null;
  risk_level: string;
  difficulty: string;
  description: string | null;
  created_at: string;
};

export type GovernmentScheme = {
  id: string;
  scheme_name: string;
  description: string;
  benefits: string | null;
  eligibility: string | null;
  required_documents: string | null;
  application_process: string | null;
  category: string;
  farming_type: string | null;
  location: string | null;
  official_source: string | null;
  last_verified: string;
  created_at: string;
};

export type KnowledgeArticle = {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  sources: string | null;
  last_updated: string;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export type MarketplaceListing = {
  id: string;
  user_id: string;
  farm_id: string | null;
  title: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};
