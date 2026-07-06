"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { RootState } from "@/store";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
        <p className="mt-4 text-xs font-mono text-zinc-500 uppercase tracking-widest animate-pulse">
          Authenticating...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
