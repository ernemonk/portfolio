import { getAllServices } from "@/lib/service-registry";
import ServicePageClient from "./ServicePageClient";

export function generateStaticParams() {
  const services = getAllServices();
  return services.map((service) => ({
    serviceId: service.id,
  }));
}

export default function ServicePage({ params }: { params: { serviceId: string } }) {
  return <ServicePageClient serviceId={params.serviceId} />;
}
