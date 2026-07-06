"use client";

import React from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { AuthProvider } from "@/components/AuthProvider";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { PreferencesProvider } from "@/components/PreferencesProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <HeroUIProvider>
        <ToastProvider placement="top-center" />
        <PreferencesProvider>
          <AuthProvider>{children}</AuthProvider>
        </PreferencesProvider>
      </HeroUIProvider>
    </Provider>
  );
}
