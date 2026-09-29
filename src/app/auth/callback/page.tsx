"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Procesando sesión...");

  useEffect(() => {
    async function handleCallback() {
      const supabase = createClient();

      // 1. Extraer tokens del hash manualmente
      const hash = window.location.hash.substring(1); // sacar el "#"
      const params = new URLSearchParams(hash);

      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const error = params.get("error");
      const errorDescription = params.get("error_description");

      if (error) {
        console.error("Error en callback:", error, errorDescription);
        setStatus(`Error: ${errorDescription ?? error}`);
        setTimeout(() => router.replace("/?error=auth"), 2000);
        return;
      }

      if (!accessToken || !refreshToken) {
        console.error("No hay tokens en el hash:", hash);
        setStatus("No se encontraron tokens de sesión");

        // Fallback: chequear si ya hay sesión
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          router.replace("/perfil");
          return;
        }

        setTimeout(() => router.replace("/?error=notokens"), 2000);
        return;
      }

      // 2. Establecer la sesión manualmente
      setStatus("Estableciendo sesión...");
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        console.error("Error seteando sesión:", sessionError);
        setStatus(`Error: ${sessionError.message}`);
        setTimeout(() => router.replace("/?error=session"), 2000);
        return;
      }

      // 3. Redirigir a /perfil
      setStatus("¡Listo! Redirigiendo...");
      router.replace("/perfil");
      router.refresh();
    }

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="font-display text-xs tracking-[0.3em] text-primary mb-4">
          CS-MANSILLA
        </p>
        <p className="text-muted-foreground">{status}</p>
      </div>
    </div>
  );
}