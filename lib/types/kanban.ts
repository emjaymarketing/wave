import { UserDetail } from "./calendar";

export const KANBAN_COLUMNS = [
  "Strategizing",
  "Ready to Shoot",
  "Needs Assigned to Editor",
  "Ready to Edit",
  "Editing",
  "Ready for Review",
  "Inside CC Being Reviewed",
  "Ready to Post",
  "Completed Graphic",
  "Scheduled / Posted",
] as const;

export type KanbanColumn = (typeof KANBAN_COLUMNS)[number];

export interface KanbanItem {
  id: string;
  calendar_event_id?: string | null;
  title: string;
  assigned_client_id?: string | null;
  assigned_client?: UserDetail;
  assignee_id?: string | null;
  assignee?: UserDetail;
  column: KanbanColumn;
  order_index: number;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}
