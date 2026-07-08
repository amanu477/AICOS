import { useState, useEffect } from "react";

export interface StoreInfo {
  id: string;
  name: string;
  shopifyDomain: string;
  currency: string;
  syncStatus: string;
  lastSyncedAt: string | null;
}

/** Fetches the current user's first connected Shopify store. */
export function useCurrentStore() {
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stores", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setStore(data?.stores?.[0] ?? null))
      .catch(() => setStore(null))
      .finally(() => setLoading(false));
  }, []);

  return { store, storeId: store?.id ?? null, loading };
}
