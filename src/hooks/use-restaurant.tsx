"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { Restaurant } from "@/types";

interface RestaurantContextType {
  /** The currently selected restaurant */
  current: Restaurant | null;
  /** All restaurants owned by this user */
  restaurants: Restaurant[];
  /** Whether the initial load is still in progress */
  loading: boolean;
  /** Switch to a different restaurant by ID */
  switchRestaurant: (id: string) => void;
  /** Delete a restaurant by ID (cascades all related data) */
  deleteRestaurant: (id: string) => Promise<void>;
  /** Reload the restaurant list (e.g. after creating a new one) */
  refresh: () => Promise<void>;
}

const RestaurantContext = createContext<RestaurantContextType>({
  current: null,
  restaurants: [],
  loading: true,
  switchRestaurant: () => {},
  deleteRestaurant: async () => {},
  refresh: async () => {},
});

export function useRestaurant() {
  return useContext(RestaurantContext);
}

const STORAGE_KEY = "operon_current_restaurant";

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [current, setCurrent] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const loadRestaurants = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("restaurants")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    const list = (data ?? []) as unknown as Restaurant[];
    setRestaurants(list);

    if (list.length > 0) {
      // Restore previously selected restaurant from localStorage
      const savedId =
        typeof window !== "undefined"
          ? localStorage.getItem(STORAGE_KEY)
          : null;
      const saved = savedId ? list.find((r) => r.id === savedId) : null;
      setCurrent(saved ?? list[0]);
    } else {
      setCurrent(null);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadRestaurants();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadRestaurants]);

  const switchRestaurant = useCallback(
    (id: string) => {
      // Always persist the selection — even if the restaurants list hasn't
      // been refreshed yet, loadRestaurants will pick up the saved ID.
      localStorage.setItem(STORAGE_KEY, id);
      const found = restaurants.find((r) => r.id === id);
      if (found) {
        setCurrent(found);
      }
    },
    [restaurants]
  );

  const deleteRestaurant = useCallback(
    async (id: string) => {
      await supabase.from("restaurants").delete().eq("id", id);

      // Clear localStorage if we just deleted the saved restaurant
      const savedId = localStorage.getItem(STORAGE_KEY);
      if (savedId === id) {
        localStorage.removeItem(STORAGE_KEY);
      }

      // Reload the list — will auto-select another restaurant or null
      await loadRestaurants();
    },
    [supabase, loadRestaurants]
  );

  const refresh = useCallback(async () => {
    await loadRestaurants();
  }, [loadRestaurants]);

  return (
    <RestaurantContext.Provider
      value={{ current, restaurants, loading, switchRestaurant, deleteRestaurant, refresh }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}
