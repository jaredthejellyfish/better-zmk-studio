import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from "react";

export const CurrentStepContext = createContext<number>(1);
export const SetCurrentStepContext = createContext<
  Dispatch<SetStateAction<number>> | undefined
>(undefined);

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
