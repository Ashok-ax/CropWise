/*
# Add welcome notification on new user signup

1. Functions
- Updated `handle_new_user()` trigger to also insert a welcome notification for the new farmer.
2. Notes
- The notification appears on the farmer's dashboard when they first log in.
- Existing trigger is replaced (DROP + CREATE).
*/

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
