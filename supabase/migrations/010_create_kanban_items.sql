-- Create kanban_items table
CREATE TABLE IF NOT EXISTS public.kanban_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_event_id UUID UNIQUE REFERENCES public.calendar_events(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  assigned_client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  "column" TEXT NOT NULL DEFAULT 'Strategizing' CHECK ("column" IN (
    'Strategizing',
    'Ready to Shoot',
    'Needs Assigned to Editor',
    'Ready to Edit',
    'Editing',
    'Ready for Review',
    'Inside CC Being Reviewed',
    'Ready to Post',
    'Completed Graphic',
    'Scheduled / Posted'
  )),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.kanban_items ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins have full access to kanban_items"
  ON public.kanban_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Clients can read kanban items assigned to them
CREATE POLICY "Clients can view their kanban_items"
  ON public.kanban_items
  FOR SELECT
  TO authenticated
  USING (
    assigned_client_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes for performance
CREATE INDEX idx_kanban_items_calendar_event_id ON public.kanban_items(calendar_event_id);
CREATE INDEX idx_kanban_items_column ON public.kanban_items("column");
CREATE INDEX idx_kanban_items_assigned_client_id ON public.kanban_items(assigned_client_id);
CREATE INDEX idx_kanban_items_order ON public.kanban_items("column", order_index);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_kanban_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER kanban_items_updated_at
  BEFORE UPDATE ON public.kanban_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_kanban_items_updated_at();
