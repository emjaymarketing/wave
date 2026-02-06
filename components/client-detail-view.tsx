"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Clock, Calendar, Activity } from "lucide-react";

interface ClientEvent {
  id: string;
  task_name: string;
  due_date: string;
  status: string;
  priority: string;
}

interface ClientDetail {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  client_since: string;
  last_sign_in_at: string | null;
  recent_events: ClientEvent[];
}

function formatDuration(dateStr: string): string {
  const since = new Date(dateStr);
  const now = new Date();
  const days = Math.floor(
    (now.getTime() - since.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""}`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return `${years} year${years !== 1 ? "s" : ""}`;
  return `${years}y ${rem}mo`;
}

function statusColor(status: string) {
  switch (status) {
    case "completed":
      return "default" as const;
    case "in_progress":
      return "secondary" as const;
    case "pending":
      return "outline" as const;
    default:
      return "outline" as const;
  }
}

function priorityColor(priority: string) {
  switch (priority) {
    case "high":
      return "destructive" as const;
    case "medium":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}

export function ClientDetailView({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClient() {
      try {
        const res = await fetch(`/api/clients/${clientId}`);
        if (!res.ok) {
          setError("Client not found");
          return;
        }
        const data = await res.json();
        setClient(data);
      } catch {
        setError("Failed to load client");
      } finally {
        setLoading(false);
      }
    }
    fetchClient();
  }, [clientId]);

  if (loading) {
    return (
      <div className="flex-1 w-full flex flex-col gap-8">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-muted animate-pulse" />
          <div className="space-y-3">
            <div className="h-6 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 w-24 bg-muted rounded mb-2" />
                <div className="h-6 w-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="flex-1 w-full flex flex-col gap-8">
        <button
          onClick={() => router.push("/admin/clients")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">{error || "Client not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <button
        onClick={() => router.push("/admin/clients")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Clients
      </button>

      {/* Client Header */}
      <div className="flex items-center gap-6">
        {client.avatar_url ? (
          <img
            src={client.avatar_url}
            alt={client.full_name}
            className="w-20 h-20 rounded-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
            {client.full_name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold">{client.full_name}</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Mail className="h-4 w-4" />
            {client.email}
          </p>
        </div>
      </div>

      {/* Client Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Client Since
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {new Date(client.client_since).toLocaleDateString()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {formatDuration(client.client_since)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Membership Duration
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatDuration(client.client_since)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last Active
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {client.last_sign_in_at
                ? new Date(client.last_sign_in_at).toLocaleDateString()
                : "Never"}
            </p>
            {client.last_sign_in_at && (
              <p className="text-sm text-muted-foreground mt-1">
                {formatDuration(client.last_sign_in_at)} ago
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Tasks</h2>
        {client.recent_events.length === 0 ? (
          <div className="text-center py-8 border rounded-lg">
            <p className="text-muted-foreground">
              No tasks assigned to this client yet.
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-medium">Task</th>
                  <th className="text-left p-4 font-medium">Due Date</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Priority</th>
                </tr>
              </thead>
              <tbody>
                {client.recent_events.map((event) => (
                  <tr key={event.id} className="border-t hover:bg-muted/50">
                    <td className="p-4 font-medium">{event.task_name}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(event.due_date).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <Badge variant={statusColor(event.status)}>
                        {event.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant={priorityColor(event.priority)}>
                        {event.priority}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
