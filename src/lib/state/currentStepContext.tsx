import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

export const CurrentStepContext = createContext<number>(1);
const SetCurrentStepContext = createContext<
  Dispatch<SetStateAction<number>> | undefined
>(undefined);

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

export const useCurrentStep = () => {
  return useContext(CurrentStepContext);
};

export const useSetCurrentStep = () => {
  const setCurrentStep = useContext(SetCurrentStepContext);
  if (!setCurrentStep) {
    throw new Error(
      "useSetCurrentStep must be used within a CurrentStepProvider"
    );
  }
  return setCurrentStep;
};
