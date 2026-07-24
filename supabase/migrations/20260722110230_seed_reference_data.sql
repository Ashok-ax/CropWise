CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Farmer'));

  INSERT INTO public.notifications (user_id, title, body, type)
  VALUES (
    NEW.id,
    'Welcome to CropWise!',
    'Complete your onboarding to set up your farm and start receiving personalized recommendations.',
    'info'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO crop_catalog (crop_name, category, water_requirement, growing_period_days, suitable_seasons, suitable_soil_types, estimated_investment_per_acre, estimated_revenue_per_acre, risk_level, difficulty, description)
VALUES
  ('Rice (Paddy)', 'cereal', 'high', 110, ARRAY['kharif','monsoon'], ARRAY['clay','loam'], 25000, 55000, 'medium', 'medium', 'Staple cereal crop requiring standing water; suited to clay and loam soils in kharif/monsoon season.'),
  ('Wheat', 'cereal', 'medium', 120, ARRAY['rabi','winter'], ARRAY['loam','alluvial'], 20000, 45000, 'low', 'easy', 'Winter cereal; grows well in loam and alluvial soils with moderate water.'),
  ('Maize', 'cereal', 'medium', 90, ARRAY['kharif','summer'], ARRAY['loam','sandy loam'], 18000, 40000, 'medium', 'easy', 'Versatile cereal used for grain and fodder; warm-season crop.'),
  ('Cotton', 'cash', 'medium', 160, ARRAY['kharif'], ARRAY['black','loam'], 35000, 80000, 'high', 'hard', 'Major fibre crop; needs careful pest management and longer growing period.'),
  ('Sugarcane', 'cash', 'high', 330, ARRAY['spring','monsoon'], ARRAY['loam','alluvial'], 60000, 150000, 'medium', 'medium', 'Long-duration cash crop with high water requirement and high revenue potential.'),
  ('Groundnut', 'oilseed', 'low', 110, ARRAY['kharif','summer'], ARRAY['sandy','sandy loam'], 22000, 50000, 'medium', 'medium', 'Oilseed crop suited to sandy soils with lower water needs.'),
  ('Tomato', 'vegetable', 'medium', 90, ARRAY['rabi','summer'], ARRAY['loam','sandy loam'], 30000, 70000, 'high', 'medium', 'Popular vegetable with good market demand; needs staking and pest control.'),
  ('Onion', 'vegetable', 'low', 100, ARRAY['rabi','kharif'], ARRAY['loam','sandy loam'], 28000, 65000, 'medium', 'medium', 'Storage-friendly vegetable with seasonal price volatility.'),
  ('Banana', 'fruit', 'high', 300, ARRAY['spring','monsoon'], ARRAY['loam','alluvial'], 50000, 120000, 'medium', 'medium', 'Perennial fruit crop with high water and nutrient needs.'),
  ('Mango', 'fruit', 'low', 1095, ARRAY['spring','summer'], ARRAY['loam','alluvial'], 40000, 100000, 'low', 'easy', 'Long-term orchard crop; first yield after 3-5 years.'),
  ('Soybean', 'oilseed', 'medium', 100, ARRAY['kharif'], ARRAY['loam','sandy loam'], 20000, 48000, 'medium', 'easy', 'Protein-rich oilseed improving soil nitrogen; kharif crop.'),
  ('Bengal Gram (Chickpea)', 'pulse', 'low', 110, ARRAY['rabi'], ARRAY['loam','black'], 16000, 42000, 'low', 'easy', 'Rabi pulse crop; drought-tolerant and fixes soil nitrogen.')
ON CONFLICT DO NOTHING;

INSERT INTO government_schemes (scheme_name, description, benefits, eligibility, required_documents, application_process, category, farming_type, location, official_source, last_verified)
VALUES
  ('PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)', 'Central scheme providing income support to small and marginal farmers.', 'Rs 6,000 per year in three installments directly to bank accounts.', 'Small and marginal farmers holding cultivable land. Institutional landholders, higher income taxpayers excluded.', 'Aadhaar, land ownership documents, bank account details.', 'Register at nearest Common Service Centre (CSC) or online via pmkisan.gov.in. Verification by local revenue authorities.', 'income support', 'all', 'India', 'https://pmkisan.gov.in', CURRENT_DATE),
  ('Pradhan Mantri Fasal Bima Yojana (PMFBY)', 'Crop insurance scheme protecting farmers against natural calamities, pests and diseases.', 'Comprehensive crop insurance cover at subsidized premiums (2% kharif, 1.5% rabi, 5% horticulture).', 'All farmers growing notified crops in notified areas. Loanee farmers compulsory; others voluntary.', 'Aadhaar, land documents, bank account, sowing certificate.', 'Contact nearest bank, CSC, or insurance company empanelled under PMFBY. Online via portal.', 'insurance', 'crop', 'India', 'https://pmfby.gov.in', CURRENT_DATE),
  ('Soil Health Card Scheme', 'Free soil testing and health cards to farmers with nutrient-based fertilizer recommendations.', 'Free soil test every 2 years with customized fertilizer recommendations per plot.', 'All farmers owning cultivable land.', 'Land ownership documents, Aadhaar.', 'Visit nearest soil testing lab or contact village agriculture officer.', 'soil health', 'all', 'India', 'https://soilhealth.dac.gov.in', CURRENT_DATE),
  ('Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)', 'Scheme to expand irrigated area and improve water use efficiency.', 'Subsidies for micro-irrigation (drip/sprinkler), farm ponds, and water harvesting structures.', 'All farmers; micro-irrigation subsidies vary by state.', 'Land documents, Aadhaar, bank account, quotation for equipment.', 'Apply at district agriculture/horticulture office or online state portal.', 'irrigation', 'all', 'India', 'https://pmkpy.gov.in', CURRENT_DATE),
  ('Kisan Credit Card (KCC)', 'Easy access to short-term credit for cultivation, equipment, and post-harvest needs.', 'Collateral-free loan up to Rs 1.6 lakh at 4% effective interest (with subvention). Interest subvention for prompt repayment.', 'All farmers, share croppers, tenant farmers, dairy and fisheries farmers.', 'Land documents, Aadhaar, bank account, KCC application form.', 'Apply at your bank branch with land documents. Sanction typically within 2-3 weeks.', 'credit', 'all', 'India', 'https://www.myscheme.gov.in/schemes/kcc', CURRENT_DATE),
  ('National Mission on Natural Farming', 'Promotes natural/organic farming to reduce input costs and improve soil health.', 'Financial assistance for training, inputs, and demonstration; up to Rs 19,000/ha over 3 years.', 'Farmers willing to adopt natural farming practices; individual and group clusters.', 'Land documents, Aadhaar, bank account.', 'Apply through state agriculture department or cluster coordinator.', 'organic farming', 'all', 'India', 'https://nfsb.gov.in', CURRENT_DATE)
ON CONFLICT DO NOTHING;

INSERT INTO knowledge_articles (title, category, summary, content, sources, last_updated)
VALUES
  ('Understanding Soil pH for Healthy Crops', 'soil management', 'Learn why soil pH matters and how to correct it for better yields.', 'Soil pH measures acidity or alkalinity on a scale of 0 to 14. Most crops grow best at pH 6.0 to 7.5. Acidic soils (below 5.5) reduce nutrient availability; alkaline soils (above 8.5) cause micronutrient deficiencies. Apply lime to raise pH of acidic soils and gypsum or sulphur to lower pH of alkaline soils. Always test soil before applying amendments.', 'ICAR Indian Institute of Soil Science; state soil testing labs.', CURRENT_DATE),
  ('Drip Irrigation: Save Water, Grow More', 'irrigation', 'Drip irrigation delivers water directly to roots, saving 30-60% water.', 'Drip irrigation uses perforated tubes and emitters to deliver water directly to the root zone, reducing evaporation and weed growth. It is ideal for vegetables, fruits, and sugarcane. Subsidies up to 55% are available under PMKSY. Combine drip with fertigation for best results.', 'PMKSY guidelines; ICAR Central Institute of Agricultural Engineering.', CURRENT_DATE),
  ('Balanced Fertilizer Use: NPK Basics', 'fertilizers', 'Nitrogen, Phosphorus, and Potassium are the primary macronutrients crops need.', 'Nitrogen (N) promotes leaf and stem growth, Phosphorus (P) supports root and flower development, and Potassium (K) improves disease resistance and fruit quality. Apply based on soil test recommendations. Split nitrogen into 2-3 doses to reduce losses. Use organic manure along with chemical fertilizers for balanced nutrition.', 'ICAR fertilizer recommendation handbook; state agriculture universities.', CURRENT_DATE),
  ('Integrated Pest Management (IPM) in Crops', 'pest management', 'IPM combines biological, cultural, and chemical methods to control pests responsibly.', 'Integrated Pest Management integrates biological control (predators, parasitoids), cultural practices (crop rotation, resistant varieties), and judicious chemical use. Monitor pests regularly with light/pheromone traps. Apply pesticides only when pest populations cross economic threshold levels. Always follow label instructions and pre-harvest intervals.', 'National Institute of Plant Health Management; ICAR IPM package.', CURRENT_DATE),
  ('Organic Farming: Getting Started', 'organic farming', 'Transition to organic farming with composting, green manure, and natural inputs.', 'Organic farming avoids synthetic fertilizers and pesticides. Build soil fertility with compost, vermicompost, green manure (e.g., dhaincha, sunhemp), and biofertilizers. Use neem oil, trichoderma, and bacillus thuringiensis for pest control. A 2-3 year transition period is typical. Certification requires third-party verification.', 'NPOP standards; National Centre of Organic and Natural Farming.', CURRENT_DATE),
  ('Cattle Vaccination Schedule', 'livestock', 'Protect your cattle with timely vaccinations against major diseases.', 'Vaccinate cattle against Foot and Mouth Disease (FMD) every 6 months, Hemorrhagic Septicemia (HS) and Black Quarter (BQ) annually before monsoon, and Brucellosis once for female calves aged 4-8 months. Maintain vaccination records. Consult a veterinarian for a herd-specific schedule.', 'ICAR Indian Veterinary Research Institute; state animal husbandry departments.', CURRENT_DATE),
  ('Poultry Layer Management Basics', 'poultry', 'Key practices for healthy, productive layer flocks.', 'Provide 16-18 hours of light per day for layers. Maintain 18-22 C temperature and good ventilation. Feed layer mash with 16-18% protein and 3.5-4% calcium. Vaccinate against Newcastle (Ranikhet), Gumboro, and Fowl Pox. Monitor egg production daily; a sudden drop signals health or environment issues.', 'ICAR Directorate of Poultry Research; state veterinary universities.', CURRENT_DATE),
  ('Fish Pond Water Quality Management', 'fisheries', 'Maintain pH, oxygen, and temperature for healthy fish growth.', 'Ideal pond water pH is 6.5-9.0; dissolved oxygen should exceed 5 mg/L; temperature 25-32 C for tropical species. Monitor morning and evening. Use lime to correct low pH and aerators or water exchange when oxygen drops. Avoid overfeeding to prevent ammonia build-up.', 'ICAR Central Institute of Freshwater Aquaculture.', CURRENT_DATE)
ON CONFLICT DO NOTHING;