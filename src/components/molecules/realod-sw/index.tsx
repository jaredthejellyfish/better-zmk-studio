import { Button } from "@/components/atoms/ui/button";

function ReloadSW() {
  const handleReloadCached = async () => {
    try {
      // Unregister all service workers
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((r) => r.unregister()));
      }

      // Clear caches
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }

      // Clear storage (localStorage, sessionStorage, IndexedDB, etc.)
      try {
        localStorage.clear();
      } catch {
        console.error("Failed to clear localStorage");
      }
      try {
        sessionStorage.clear();
      } catch {
        console.error("Failed to clear sessionStorage");
      }
      if ("storage" in navigator && "estimate" in navigator.storage) {
        // no-op: cannot clear via estimate, but keep for future
      }
      if ("indexedDB" in window) {
        // Best-effort: enumerate known DBs if available
        // Some browsers support indexedDB.databases()
        const anyIDB = indexedDB as unknown as {
          databases?: () => Promise<Array<{ name?: string }>>;
          deleteDatabase: (name: string) => unknown;
        };
        if (anyIDB.databases) {
          try {
            const dbs = await anyIDB.databases();
            await Promise.all(
              dbs
                .map((d) => d.name)
                .filter((n): n is string => Boolean(n))
                .map((name) => anyIDB.deleteDatabase(name))
            );
          } catch {
            console.error("Failed to clear indexedDB");
          }
        }
      }

      // Reload to apply
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };
  return (
    <Button type="button" variant="destructive" onClick={handleReloadCached}>
      Reset offline data
    </Button>
  );
}

export default ReloadSW;
