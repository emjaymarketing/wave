import { ClientDetailView } from "@/components/client-detail-view";
import { Suspense } from "react";

async function ClientDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClientDetailView clientId={id} />;
}

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientDetailContent params={params} />
    </Suspense>
  );
}
