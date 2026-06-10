"use client";

import PortalShell from "@/components/portal/PortalShell";
import ServiceDetailView from "@/components/portal/ServiceDetailView";
import { useAuth } from "@/context/AuthContext";

interface ServicePageClientProps {
  serviceId: string;
}

export default function ServicePageClient({ serviceId }: ServicePageClientProps) {
  const { user } = useAuth();

  if (!user) {
    return (
      <PortalShell title="Service Detail">
        <div className="text-center py-20 text-white/40">
          Please sign in to access service details.
        </div>
      </PortalShell>
    );
  }

  return (
    <PortalShell title={`Service: ${serviceId}`}>
      <ServiceDetailView serviceId={serviceId} />
    </PortalShell>
  );
}
