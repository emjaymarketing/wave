import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/auth/roles";
import { UserRole } from "@/lib/types/roles";

export default function CalendarPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">Calendar</h1>
        <p className="text-muted-foreground mt-2">
          Schedule and manage appointments
        </p>
      </div>

      <div className="border rounded-lg p-8 text-center">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-2">Calendar Coming Soon</h3>
          <p className="text-muted-foreground">
            The calendar feature will be available here. You'll be able to
            schedule appointments, view upcoming events, and manage your
            schedule.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-2">Upcoming Events</h3>
          <p className="text-muted-foreground text-sm">
            No upcoming events scheduled.
          </p>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-2">Recent Activity</h3>
          <p className="text-muted-foreground text-sm">
            No recent calendar activity.
          </p>
        </div>
      </div>
    </div>
  );
}
