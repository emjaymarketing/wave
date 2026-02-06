-- Update calendar_events table to use assigned_client_id instead of requester_source
ALTER TABLE public.calendar_events 
  DROP COLUMN IF EXISTS requester_source;

ALTER TABLE public.calendar_events 
  ADD COLUMN assigned_client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index on assigned_client_id for faster queries
CREATE INDEX IF NOT EXISTS idx_calendar_events_client ON public.calendar_events(assigned_client_id);
