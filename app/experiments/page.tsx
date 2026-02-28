import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Lab | Ernesto Monge",
  description: "Side projects, R&D experiments, and live builds currently in progress.",
};

export default function ExperimentsPage() {
  redirect("/work");
}
