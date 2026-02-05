# Admin Calendar Setup Guide

## Overview
The admin calendar system has been successfully created with full event management capabilities. All admins have access to view, create, edit, and delete calendar events.

## Database Migration

Run the database migration to create the calendar_events table:

```bash
# If using Supabase CLI
supabase db push

# Or apply the migration manually through Supabase Dashboard
# Navigate to SQL Editor and run the migration file:
# supabase/migrations/004_create_calendar_events.sql
```

## Features

### Event Attributes
Each calendar event includes:

**Primary Attributes (User Input):**
- Task Name (required)
- Requester/Source (required)
- Due Date (required)
- Status: To Do, In Progress, Completed, Blocked
- Priority: P1 (Highest), P2 (High), P3 (Medium), P4 (Low)
- Assignee: Select from admin users
- Linked Objective
- Estimated Time (in minutes)
- Description

**Logical & Calculated Attributes:**
- Overdue Toggle: Automatically calculated (boolean)
- Overdue Counter: Days overdue calculation
- Task ID: Unique identifier (UUID)
- Created Timestamp: Auto-generated
- Updated Timestamp: Auto-updated

### Views

**Calendar View:**
- Visual monthly calendar grid
- Color-coded events by priority (P1=Red, P2=Orange, P3=Yellow, P4=Blue)
- Status indicators (border colors)
- Click dates to create new events
- Click events to view/edit details
- Navigate between months

**List View:**
- Detailed list of all events
- Shows all event information
- Quick edit and delete actions
- Overdue badges with day counter

### Filters
- Filter events by status (All, To Do, In Progress, Completed, Blocked)

### Permissions
- Only users with admin role can access the calendar
- All admins can create, view, edit, and delete events
- Row Level Security (RLS) policies enforce admin-only access

## API Endpoints

- `GET /api/calendar-events` - Fetch all events (with optional filters)
- `POST /api/calendar-events` - Create new event
- `PATCH /api/calendar-events/[id]` - Update event
- `DELETE /api/calendar-events/[id]` - Delete event
- `GET /api/admins` - Fetch all admin users (for assignee dropdown)

## Usage

1. Navigate to `/admin/calendar` in your application
2. Click "Add Event" to create a new event
3. Toggle between Calendar and List views
4. Filter events by status
5. Click on calendar dates or events to interact
6. Edit or delete events using the action buttons

## Technical Stack

- **Frontend:** React, Next.js 15, TypeScript
- **UI Components:** shadcn/ui, Radix UI
- **Date Handling:** date-fns
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth with RLS

## Next Steps

1. Run the database migration
2. Ensure you have at least one admin user in your system
3. Navigate to the calendar page and start creating events!
