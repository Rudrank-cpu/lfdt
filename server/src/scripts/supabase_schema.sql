-- ====================================================================
-- EventFlow: Supabase Database Schema & RLS Policies
-- Execute this script directly in the Supabase Dashboard SQL Editor
-- ====================================================================

-- 1. Create Custom ENUM Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('HEAD', 'VIEWER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE event_status AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE location_type AS ENUM ('IN_PERSON', 'VIRTUAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE registration_status AS ENUM ('CONFIRMED', 'WAITLISTED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. User Profiles Table (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    role user_role NOT NULL DEFAULT 'VIEWER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    head_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(80) NOT NULL,
    banner_url VARCHAR(500),
    location_type location_type NOT NULL DEFAULT 'IN_PERSON',
    venue_or_url TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    max_capacity INTEGER NOT NULL CHECK (max_capacity > 0),
    status event_status NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_events_times CHECK (end_time > start_time)
);

-- 4. Registrations Table
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status registration_status NOT NULL DEFAULT 'CONFIRMED',
    ticket_code VARCHAR(32) NOT NULL UNIQUE,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ,
    CONSTRAINT uq_event_user_reg UNIQUE (event_id, user_id)
);

-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_events_catalog ON public.events(status, start_time ASC) WHERE status = 'PUBLISHED';
CREATE INDEX IF NOT EXISTS idx_events_head ON public.events(head_user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_capacity ON public.registrations(event_id, status);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON public.registrations(user_id, registered_at DESC);

-- 6. Trigger to automatically create a profile when a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Attendee'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'VIEWER')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
CREATE POLICY "Public can view profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Events Policies
DROP POLICY IF EXISTS "Public can view published events" ON public.events;
CREATE POLICY "Public can view published events" ON public.events FOR SELECT USING (status = 'PUBLISHED' OR head_user_id = auth.uid());

DROP POLICY IF EXISTS "Head users can create events" ON public.events;
CREATE POLICY "Head users can create events" ON public.events FOR INSERT WITH CHECK (
  auth.uid() = head_user_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'HEAD')
);

DROP POLICY IF EXISTS "Head users can update own events" ON public.events;
CREATE POLICY "Head users can update own events" ON public.events FOR UPDATE USING (auth.uid() = head_user_id);

DROP POLICY IF EXISTS "Head users can delete own events" ON public.events;
CREATE POLICY "Head users can delete own events" ON public.events FOR DELETE USING (auth.uid() = head_user_id);

-- Registrations Policies
DROP POLICY IF EXISTS "Users can view own registrations" ON public.registrations;
CREATE POLICY "Users can view own registrations" ON public.registrations FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Organizers can view attendees" ON public.registrations;
CREATE POLICY "Organizers can view attendees" ON public.registrations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.events WHERE events.id = registrations.event_id AND events.head_user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can cancel own registrations" ON public.registrations;
CREATE POLICY "Users can cancel own registrations" ON public.registrations FOR UPDATE USING (auth.uid() = user_id);

-- 8. Concurrency-Safe RSVP Stored Procedure (RPC)
CREATE OR REPLACE FUNCTION public.register_for_event(p_event_id UUID, p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event RECORD;
  v_confirmed_count INT;
  v_target_status registration_status;
  v_ticket_code VARCHAR(32);
  v_registration_id UUID;
  v_existing RECORD;
BEGIN
  -- 1. Exclusive Row Lock on Event
  SELECT id, max_capacity, status INTO v_event FROM public.events WHERE id = p_event_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Event not found'; END IF;
  IF v_event.status <> 'PUBLISHED' THEN RAISE EXCEPTION 'Event is not open for registration'; END IF;

  -- 2. Check existing registration
  SELECT id, status INTO v_existing FROM public.registrations WHERE event_id = p_event_id AND user_id = p_user_id;
  IF FOUND AND v_existing.status = 'CONFIRMED' THEN RAISE EXCEPTION 'Already registered for this event'; END IF;

  -- 3. Calculate capacity
  SELECT COUNT(*)::int INTO v_confirmed_count FROM public.registrations WHERE event_id = p_event_id AND status = 'CONFIRMED';
  IF v_confirmed_count < v_event.max_capacity THEN
    v_target_status := 'CONFIRMED';
  ELSE
    v_target_status := 'WAITLISTED';
  END IF;

  -- 4. Unique ticket code
  v_ticket_code := 'EF-' || UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 6));

  -- 5. Insert or Update
  IF FOUND THEN
    UPDATE public.registrations 
    SET status = v_target_status, registered_at = NOW(), cancelled_at = NULL, ticket_code = v_ticket_code 
    WHERE id = v_existing.id 
    RETURNING id INTO v_registration_id;
  ELSE
    INSERT INTO public.registrations (event_id, user_id, status, ticket_code) 
    VALUES (p_event_id, p_user_id, v_target_status, v_ticket_code) 
    RETURNING id INTO v_registration_id;
  END IF;

  RETURN jsonb_build_object(
    'registration_id', v_registration_id,
    'event_id', p_event_id,
    'status', v_target_status,
    'ticket_code', v_ticket_code,
    'message', CASE WHEN v_target_status = 'CONFIRMED' THEN 'Seat confirmed!' ELSE 'Placed on waitlist.' END
  );
END;
$$;
