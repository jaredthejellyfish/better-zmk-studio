import ReloadSW from "@/components/molecules/realod-sw";

function Settings() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Offline data reset</h2>
          <p className="text-sm text-muted-foreground">
            Unregister service workers and clear site storage.
          </p>
        </div>
        <ReloadSW />
      </div>
    </div>
  );
}

export default Settings;
