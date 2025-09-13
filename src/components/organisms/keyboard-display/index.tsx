import { useMemo } from "react";
import type {
  PhysicalLayout,
  Keymap,
} from "@zmkfirmware/zmk-studio-ts-client/keymap";
import {
  hid_usage_get_label,
  hid_usage_page_and_id_from_usage,
} from "@/lib/hid/hid-usages";
import { useSelectedKeyStore } from "@/lib/state/selectedKeyStore";

type KeyboardDisplayProps = {
  layout: PhysicalLayout;
  keymap?: Keymap | null;
  keyColor?: string;
  keyTextColor?: string;
  keyBorderColor?: string;
  groupFillColor?: string;
  groupBorderColor?: string;
};

type ProcessedKey = {
  x: number;
  y: number;
  w: number;
  h: number;
  rDeg: number;
  rx: number;
  ry: number;
  index: number;
};

export default function KeyboardDisplay({
  layout,
  keymap,
  keyColor,
  keyTextColor,
  keyBorderColor,
}: KeyboardDisplayProps) {
  const keys = useMemo(() => layout.keys ?? [], [layout]);
  const selectedKeyIndex = useSelectedKeyStore((s) => s.selectedKeyIndex);
  const setSelectedKeyIndex = useSelectedKeyStore((s) => s.setSelectedKeyIndex);

  const processed = useMemo<{
    keys: ProcessedKey[];
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  }>(() => {
    const list: ProcessedKey[] = [];
    const rotatePoint = (
      x: number,
      y: number,
      cx: number,
      cy: number,
      rad: number
    ) => {
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const dx = x - cx;
      const dy = y - cy;
      return { x: cx + dx * cos - dy * sin, y: cy + dx * sin + dy * cos };
    };

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i] as unknown as {
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        r?: number;
        rx?: number;
        ry?: number;
      };
      const w = k.width ?? 1;
      const h = k.height ?? 1;
      const x = k.x ?? 0;
      const y = k.y ?? 0;
      const rDeg = k.r ?? 0;
      const rx = k.rx ?? x + w / 2;
      const ry = k.ry ?? y + h / 2;
      const r = (rDeg * Math.PI) / 180;
      list.push({ x, y, w, h, rDeg, rx, ry, index: i });

      const corners = [
        rotatePoint(x, y, rx, ry, r),
        rotatePoint(x + w, y, rx, ry, r),
        rotatePoint(x + w, y + h, rx, ry, r),
        rotatePoint(x, y + h, rx, ry, r),
      ];
      for (const c of corners) {
        if (c.x < minX) minX = c.x;
        if (c.y < minY) minY = c.y;
        if (c.x > maxX) maxX = c.x;
        if (c.y > maxY) maxY = c.y;
      }
    }

    if (
      !isFinite(minX) ||
      !isFinite(minY) ||
      !isFinite(maxX) ||
      !isFinite(maxY)
    ) {
      minX = 0;
      minY = 0;
      maxX = 1;
      maxY = 1;
    }
    return { keys: list, minX, minY, maxX, maxY };
  }, [keys]);

  const padding = 12;
  const vbX = processed.minX - padding;
  const vbY = processed.minY - padding;
  const vbW = Math.max(1, processed.maxX - processed.minX + padding * 2);
  const vbH = Math.max(1, processed.maxY - processed.minY + padding * 2);

  const keyFill = keyColor ?? "#f3f4f6";
  const keyText = keyTextColor ?? "#0f172a";
  const keyBorder = keyBorderColor ?? "rgba(0,0,0,0.25)";

  return (
    <svg
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      preserveAspectRatio="xMidYMid meet"
      style={{
        width: "100%",
        maxWidth: "100vw",
        height: "auto",
        maxHeight: "min(80vh, 640px)",
        display: "block",
        background: "transparent",
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}
    >
      {processed.keys.map((k) => {
        const isSelected = selectedKeyIndex === k.index;
        const stroke = isSelected ? "#3b82f6" : keyBorder;
        const strokeWidth = isSelected ? 2 : 1;
        const fontSize = Math.max(0.3, Math.min(k.w, k.h) * 0.2);
        const inset = Math.min(k.w, k.h) * 0.06;
        const ix = k.x + inset / 2;
        const iy = k.y + inset / 2;
        const iw = Math.max(0, k.w - inset);
        const ih = Math.max(0, k.h - inset);
        const cornerRadius = Math.min(iw, ih) * 0.1;
        return (
          <g
            key={`k-${k.index}`}
            onClick={() => setSelectedKeyIndex(k.index)}
            style={{
              cursor: "pointer",
            }}
            transform={
              k.rDeg ? `rotate(${k.rDeg / 100} ${k.rx} ${k.ry})` : undefined
            }
          >
            <rect
              x={ix}
              y={iy}
              width={iw}
              height={ih}
              rx={cornerRadius}
              ry={cornerRadius}
              fill={isSelected ? "#dbeafe" : keyFill}
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
            {(() => {
              const activeBindings = keymap?.layers?.[0]?.bindings as
                | Array<{
                    behaviorId?: number;
                    param1?: number;
                    param2?: number;
                  }>
                | undefined;
              const binding = activeBindings?.[k.index];
              let label = "";
              if (binding && typeof binding.param1 === "number") {
                const [page, id] = hid_usage_page_and_id_from_usage(
                  binding.param1
                );
                label = hid_usage_get_label(page, id) || "";
              }
              if (label) {
                label = label.replace("Keyboard ", "");
              }
              return (
                <text
                  x={k.x + k.w / 2}
                  y={k.y + k.h / 2}
                  fill={keyText}
                  fontFamily={
                    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji"'
                  }
                  fontSize={fontSize}
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {label}
                </text>
              );
            })()}
          </g>
        );
      })}
    </svg>
  );
}

import SelectedKeyDialog from "./SelectedKeyDialog";
export { SelectedKeyDialog };
