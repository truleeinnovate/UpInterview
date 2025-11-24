// React Query Persistence Configuration
import React from "react";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import localforage from "localforage";
import { ONE_DAY } from "./queryClient";

// Configure localforage for IndexedDB storage
export const configureLocalForage = () => {
  localforage.config({
    name: "UpInterview",
    storeName: "masterData",
    description: "Master data cache for UpInterview application",
  });
};

// Create async storage adapter for localforage
export const createStorageAdapter = () => ({
  getItem: async (key) => {
    try {
      const value = await localforage.getItem(key);
      return value;
    } catch (error) {
      console.error("Error reading from localforage:", error);
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      await localforage.setItem(key, value);
    } catch (error) {
      console.error("Error writing to localforage:", error);
    }
  },
  removeItem: async (key) => {
    try {
      await localforage.removeItem(key);
    } catch (error) {
      console.error("Error removing from localforage:", error);
    }
  },
});

// Create the persister
export const createPersister = (storage) => {
  return createAsyncStoragePersister({
    storage,
    serialize: JSON.stringify,
    deserialize: JSON.parse,
  });
};

// Persistence options for React Query
export const persistOptions = (persister) => ({
  persister,
  maxAge: 7 * ONE_DAY, // 7 days
  buster: "v1", // Cache buster for versioning
  dehydrateOptions: {
    // Only persist successful master data queries
    shouldDehydrateQuery: (query) => {
      return (
        query.state.status === "success" && query.queryKey[0] === "masterData"
      );
    },
    // Don't persist mutations
    shouldDehydrateMutation: () => false,
  },
});

// Success callback for persistence
export const onPersistSuccess = () => {};

// Complete persistence configuration hook
export const usePersistenceConfig = () => {
  // Initialize localforage on first render
  React.useEffect(() => {
    configureLocalForage();
  }, []);

  // Create storage adapter
  const storage = React.useMemo(() => createStorageAdapter(), []);

  // Create persister
  const persister = React.useMemo(() => createPersister(storage), [storage]);

  // Return complete config
  return {
    persister,
    persistOptions: persistOptions(persister),
    onSuccess: onPersistSuccess,
  };
};

// Export individual pieces if needed
const persistenceConfig = {
  configureLocalForage,
  createStorageAdapter,
  createPersister,
  persistOptions,
  onPersistSuccess,
  usePersistenceConfig,
};

export default persistenceConfig;
