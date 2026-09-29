"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LeetifySyncButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSync() {
    setLoading(true);
    try {
      const res = await fetch("/api/sync/me", { method: "POST" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("No pudimos sincronizar. ¿Ya te registraste en Leetify?");
      }
    } catch {
      alert("Error de red");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleSync}
      disabled={loading}
    >
      {loading ? "Sincronizando..." : "Ya me registré, actualizar"}
    </Button>
  );
}