DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;--> statement-breakpoint
DROP FUNCTION IF EXISTS public.handle_new_user();--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.sync_user_to_account()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.accounts (
    id,
    email,
    display_name,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
		email = EXCLUDED.email,
		display_name = EXCLUDED.display_name,
		updated_at = NOW();
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.sync_user_to_account() OWNER TO postgres;

CREATE TRIGGER on_auth_user_sync
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_to_account();

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.accounts TO postgres, anon, authenticated, service_role;
