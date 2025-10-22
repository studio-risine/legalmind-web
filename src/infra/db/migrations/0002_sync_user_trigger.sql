-- Remove old trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;--> statement-breakpoint
DROP FUNCTION IF EXISTS public.handle_new_user();--> statement-breakpoint

-- Create improved function to sync user to account (handles INSERT and UPDATE)
CREATE OR REPLACE FUNCTION public.sync_user_to_account()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert or update account based on auth.users data
  INSERT INTO public.accounts (
    id,
    email,
    display_name,
    name,
    last_name,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', NEW.raw_user_meta_data->>'lastName', ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = EXCLUDED.display_name,
    name = EXCLUDED.name,
    last_name = EXCLUDED.last_name,
    updated_at = NOW();

  RETURN NEW;
END;
$$;--> statement-breakpoint

-- Set function owner to postgres superuser for proper permissions
ALTER FUNCTION public.sync_user_to_account() OWNER TO postgres;--> statement-breakpoint

-- Create trigger for both INSERT and UPDATE operations
CREATE TRIGGER on_auth_user_sync
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_to_account();--> statement-breakpoint

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;--> statement-breakpoint
GRANT ALL ON public.accounts TO postgres, anon, authenticated, service_role;--> statement-breakpoint
