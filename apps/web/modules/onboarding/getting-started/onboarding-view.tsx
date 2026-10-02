"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useOnboardingStore } from "../store/onboarding-store";

// Every route into onboarding lands here. The store persists in the browser, so clear the previous
// account's answers before the first step; Cal.diy has no plans to choose from.
export const OnboardingView = (): null => {
  const router = useRouter();
  const resetOnboarding = useOnboardingStore((state) => state.resetOnboarding);

  useEffect(() => {
    resetOnboarding();
    router.replace("/onboarding/personal/settings");
  }, [resetOnboarding, router]);

  return null;
};
