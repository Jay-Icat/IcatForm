"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AdminGate } from "@/components/admin/AdminGate";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div className="min-h-screen bg-[#050814] overflow-x-hidden">
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="gate"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{
              opacity: 0,
              scale: 1.08,
              filter: "blur(12px)",
              transition: { duration: 0.5, ease: "easeInOut" },
            }}
          >
            <AdminGate onSuccess={() => setIsAuthenticated(true)} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <AdminDashboard onLogout={() => setIsAuthenticated(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
