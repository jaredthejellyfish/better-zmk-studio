import { useMemo } from "react";

import { useSelectedKeyStore } from "@/lib/state/selectedKeyStore";
import type {
  Keymap,
  PhysicalLayout,
} from "@zmkfirmware/zmk-studio-ts-client/keymap";
import {
  hid_usage_get_label,
  hid_usage_page_and_id_from_usage,
} from "@/lib/hid/hid-usages";

export default function SelectedKeyDialog({
  layout,
  keymap,
}: {
  layout?: PhysicalLayout;
  keymap?: Keymap | null;
}) {
  const selectedKeyIndex = useSelectedKeyStore((s) => s.selectedKeyIndex);

  const keyInfo = useMemo(() => {
    if (selectedKeyIndex == null || !layout) return null;
    const key = layout.keys[selectedKeyIndex];
    const binding = keymap?.layers?.[0]?.bindings?.[selectedKeyIndex] as
      | { behaviorId?: number; param1?: number; param2?: number }
      | undefined;
    let usageLabel: string | null = null;
    let page: number | null = null;
    let id: number | null = null;
    if (binding && typeof binding.param1 === "number") {
      const [p, i] = hid_usage_page_and_id_from_usage(binding.param1);
      page = p;
      id = i;
      usageLabel = hid_usage_get_label(p, i) || null;
    }
    return { key, binding, usageLabel, page, id };
  }, [selectedKeyIndex, layout, keymap]);

  return (
    <div className="p-2.5">
      {keyInfo ? (
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Index:</span> {selectedKeyIndex}
          </div>
          <div>
            <span className="font-medium">Position:</span> x=
            {keyInfo.key.x ?? 0}, y={keyInfo.key.y ?? 0}, w=
            {keyInfo.key.width ?? 1}, h={keyInfo.key.height ?? 1}
          </div>
          <div>
            <span className="font-medium">Rotation:</span> r=
            {keyInfo.key.r ?? 0}
          </div>
          <div>
            <span className="font-medium">Binding:</span>{" "}
            {keyInfo.usageLabel ?? "(none)"}
          </div>
          {keyInfo.page != null && keyInfo.id != null ? (
            <div>
              <span className="font-medium">Usage:</span> page={keyInfo.page},
              id={keyInfo.id}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">No key selected.</div>
      )}
    </div>
  );
}
