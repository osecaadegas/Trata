-- =====================================================
-- Harden Google OAuth user creation
-- =====================================================
-- Fixes Supabase Auth error:
-- "Database error saving new user"
--
-- The usual cause is public.handle_new_user() failing during the
-- auth.users insert, often because public.users already has a stale/manual
-- row with the same email but a different UUID.

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS name TEXT;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_email TEXT := COALESCE(NEW.email, NEW.id::TEXT || '@auth.local');
    v_name TEXT := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(COALESCE(NEW.email, NEW.id::TEXT), '@', 1)
    );
    v_avatar TEXT := COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        'https://ui-avatars.com/api/?name=' || split_part(COALESCE(NEW.email, NEW.id::TEXT), '@', 1) || '&background=10b981&color=fff'
    );
BEGIN
    BEGIN
        -- Free the unique email if an old manually-created public.users row
        -- already has this address under a different UUID.
        UPDATE public.users
        SET email = public.users.email || '.duplicate-' || substring(public.users.id::TEXT from 1 for 8)
        WHERE lower(public.users.email) = lower(v_email)
          AND public.users.id <> NEW.id;

        INSERT INTO public.users (id, email, name, avatar_url, role)
        VALUES (NEW.id, v_email, v_name, v_avatar, 'user')
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            name = COALESCE(EXCLUDED.name, public.users.name),
            avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
            role = COALESCE(public.users.role, 'user');
    EXCEPTION WHEN OTHERS THEN
        -- Do not block Supabase Auth login because of profile sync.
        RAISE WARNING 'handle_new_user failed for auth user %: %', NEW.id, SQLERRM;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- If the failing account already exists in auth.users from a partial/previous
-- attempt, this backfills the matching public.users row.
INSERT INTO public.users (id, email, name, avatar_url, role)
SELECT
    au.id,
    COALESCE(au.email, au.id::TEXT || '@auth.local'),
    COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', split_part(COALESCE(au.email, au.id::TEXT), '@', 1)),
    COALESCE(au.raw_user_meta_data->>'avatar_url', 'https://ui-avatars.com/api/?name=' || split_part(COALESCE(au.email, au.id::TEXT), '@', 1) || '&background=10b981&color=fff'),
    'user'
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1
    FROM public.users pu
    WHERE pu.id = au.id
)
ON CONFLICT (id) DO NOTHING;

SELECT 'Google OAuth signup trigger hardened' AS result;
