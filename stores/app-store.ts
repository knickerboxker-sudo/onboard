import { create } from "zustand";

interface AppState {
  currentUserId: string | null;
  userRole: "CUSTOMER" | "DRIVER" | "BOTH" | null;
  notificationCount: number;
  driverLocation: { lat: number; lng: number } | null;
  setCurrentUser: (id: string | null, role: "CUSTOMER" | "DRIVER" | "BOTH" | null) => void;
  setNotificationCount: (count: number) => void;
  setDriverLocation: (location: { lat: number; lng: number } | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUserId: null,
  userRole: null,
  notificationCount: 0,
  driverLocation: null,
  setCurrentUser: (id, role) => set({ currentUserId: id, userRole: role }),
  setNotificationCount: (count) => set({ notificationCount: count }),
  setDriverLocation: (location) => set({ driverLocation: location }),
}));
