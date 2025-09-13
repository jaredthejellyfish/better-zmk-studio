import { useConnectedDeviceData } from "@/lib/rpc/useConnectedDeviceData";
import { Keymap } from "@zmkfirmware/zmk-studio-ts-client/keymap";
import useLayouts from "@/hooks/useLayouts";
import { useMemo } from "react";
import PageHead from "@/components/atoms/page-head";
import KeyboardDisplay, {
  SelectedKeyDialog,
} from "@/components/organisms/keyboard-display";

export default function Keybinds() {
  const [layouts, , selectedPhysicalLayoutIndex] = useLayouts();
  const [keymap, , isLoading] = useConnectedDeviceData<Keymap>(
    { keymap: { getKeymap: true } },
    (keymap) => {
      return keymap?.keymap?.getKeymap;
    },
    true
  );

  const selectedLayout = useMemo(
    () =>
      layouts && layouts.length > 0
        ? layouts[selectedPhysicalLayoutIndex]
        : undefined,
    [layouts, selectedPhysicalLayoutIndex]
  );
  return (
    <>
      <PageHead
        title="Keymap | better-zmk-studio"
        description="View your keyboard's layout and active layer bindings."
      />
      <div>
        <div style={{ marginBottom: 12 }}>
          {selectedLayout && !isLoading ? (
            <div className="p-10">
              <div style={{ marginBottom: 8 }}>{selectedLayout.name}</div>
              <div>
                <KeyboardDisplay layout={selectedLayout} keymap={keymap} />
                <SelectedKeyDialog layout={selectedLayout} keymap={keymap} />
              </div>
            </div>
          ) : (
            <div>No physical layout available.</div>
          )}
        </div>
      </div>
    </>
  );
}
