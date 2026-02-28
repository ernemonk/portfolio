import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Ventures | Ernesto Monge",
  description:
    "Companies, platforms, and assets Ernesto Monge has built, founded, or contributed to.",
};

export default function VenturesPage() {
  redirect("/work");
}
