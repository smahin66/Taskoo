import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FocusState {
  totalFocusMinutes: number;
  isActive: boolean;
  addFocusMinutes: (minutes: number) => void;
  setActive: (active: boolean) => void;
}

export const useFocusStore = create<FocusState>()(
  persist(
    (set) => ({
      totalFocusMinutes: 0,
      isActive: false,
      addFocusMinutes: (minutes) => 
        set((state) => ({
          totalFocusMinutes: state.totalFocusMinutes + minutes
        })),
      setActive: (active: boolean) =>
        set(() => ({ isActive: active }))
    }),
    {
      name: 'focus-storage'
    }
  )
);