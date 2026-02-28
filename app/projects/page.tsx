import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Projects | Ernesto Monge",
  description:
    "Enterprise integrations, data pipelines, IoT systems, and full-stack builds by Ernesto Monge.",
};

export default function ProjectsPage() {
  redirect("/work");
}
