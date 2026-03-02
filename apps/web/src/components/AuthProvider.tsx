"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { checkAuth } from "@/store/slices/authSlice";
import { AppDispatch } from "@/store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Check if user is already authenticated on app load
    dispatch(checkAuth()).catch(() => {
      // User is not authenticated, which is fine
    });
  }, [dispatch]);

  return <>{children}</>;
}
