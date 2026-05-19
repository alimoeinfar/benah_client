"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { OrganisationPage } from "@/components/dashboard/pages/OrganisationPage";

export default function OrganisationRoute() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (!user || user.role !== 'admin') return null;

  return <OrganisationPage />;
}
