import { useState, type ReactNode } from "react";
import { CurrentStepContext, SetCurrentStepContext } from "./currentStep";

export function CurrentStepProvider({
  children,
  initialStep = 1,
}: {
  children: ReactNode;
  initialStep?: number;
}) {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  return (
    <CurrentStepContext.Provider value={currentStep}>
      <SetCurrentStepContext.Provider value={setCurrentStep}>
        {children}
      </SetCurrentStepContext.Provider>
    </CurrentStepContext.Provider>
  );
}
