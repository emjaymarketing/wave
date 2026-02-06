export interface UserDetail {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
}

export interface CalendarEvent {
  id: string;
  task_name: string;
  assigned_client_id?: string;
  assigned_client?: UserDetail;
  due_date: string;
  status: string;
  priority: string;
  assignee_id?: string;
  assignee?: UserDetail;
  linked_objective?: string;
  estimated_time?: number;
  description?: string;
  overdue_toggle: boolean;
  overdue_days?: number;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}
