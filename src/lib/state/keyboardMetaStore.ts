import { create } from "zustand";

export type KeyboardMetaState = {
  portName: string | null;
  deviceName: string | null;
  serialNumber: string | null;
  setPortName: (portName: string | null) => void;
  setDeviceName: (deviceName: string | null) => void;
  setSerialNumber: (serialNumber: string | null) => void;
  reset: () => void;
};

const initialState = {
  portName: null as string | null,
  deviceName: null as string | null,
  serialNumber: null as string | null,
};

export const useKeyboardMetaStore = create<KeyboardMetaState>((set) => ({
  ...initialState,
  setPortName: (portName) => set({ portName }),
  setDeviceName: (deviceName) => set({ deviceName }),
  setSerialNumber: (serialNumber) => set({ serialNumber }),
  reset: () => set({ ...initialState }),
}));
