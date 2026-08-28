"use client";

import React, { useState } from "react";
import { AdminGate } from "@/components/admin/AdminGate";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <AdminGate onSuccess={() => setIsAuthenticated(true)} />;
  }

  return <AdminDashboard onLogout={() => setIsAuthenticated(false)} />;
}
