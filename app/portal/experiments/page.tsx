"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ExperimentsPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/portal/work"); }, [router]);
  return null;
}
