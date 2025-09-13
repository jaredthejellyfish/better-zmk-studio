import { useConnectedDeviceData } from "@/lib/rpc/useConnectedDeviceData";
import { Keymap } from "@zmkfirmware/zmk-studio-ts-client/keymap";
import useLayouts from "@/hooks/useLayouts";
import { useEffect, useMemo, useRef, useState } from "react";

export default function Home() {
  const [layouts, , selectedPhysicalLayoutIndex] = useLayouts();
  const [keymap] = useConnectedDeviceData<Keymap>(
    { keymap: { getKeymap: true } },
    (keymap) => {
      console.log("Got the keymap!");
      return keymap?.keymap?.getKeymap;
    },
    true
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedKeyIndex, setSelectedKeyIndex] = useState<number | null>(null);
  const transformRef = useRef<{
    offsetX: number;
    offsetY: number;
    scale: number;
  }>({
    offsetX: 0,
    offsetY: 0,
    scale: 1,
  });

  const selectedLayout = useMemo(
    () =>
      layouts && layouts.length > 0
        ? layouts[selectedPhysicalLayoutIndex]
        : undefined,
    [layouts, selectedPhysicalLayoutIndex]
  );

  useEffect(() => {
    const canvasMaybe = canvasRef.current;
    const containerMaybe = containerRef.current;
    if (!canvasMaybe || !containerMaybe) return;

    const ctxMaybe = canvasMaybe.getContext("2d");
    if (!ctxMaybe) return;

    const canvas = canvasMaybe as HTMLCanvasElement;
    const container = containerMaybe as HTMLDivElement;
    const ctx = ctxMaybe as CanvasRenderingContext2D;

    let frameId: number | null = null;
    let scheduled = false;

    function rotatePoint(
      x: number,
      y: number,
      cx: number,
      cy: number,
      rad: number
    ) {
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const dx = x - cx;
      const dy = y - cy;
      return { x: cx + dx * cos - dy * sin, y: cy + dx * sin + dy * cos };
    }

    function computeBounds() {
      if (!selectedLayout || selectedLayout.keys.length === 0) {
        return { minX: 0, minY: 0, maxX: 1, maxY: 1 };
      }

      let minX = Number.POSITIVE_INFINITY;
      let minY = Number.POSITIVE_INFINITY;
      let maxX = Number.NEGATIVE_INFINITY;
      let maxY = Number.NEGATIVE_INFINITY;

      for (const key of selectedLayout.keys) {
        const w = key.width || 1;
        const h = key.height || 1;
        const x = key.x || 0;
        const y = key.y || 0;
        const rDeg = key.r || 0;
        const rx = key.rx ?? x + w / 2;
        const ry = key.ry ?? y + h / 2;
        const r = (rDeg * Math.PI) / 180;

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
        return { minX: 0, minY: 0, maxX: 1, maxY: 1 };
      }
      return { minX, minY, maxX, maxY };
    }

    function draw() {
      scheduled = false;

      const dpr = window.devicePixelRatio || 1;
      const { clientWidth, clientHeight } = container;
      const cssWidth = Math.max(1, clientWidth);
      const cssHeight = Math.max(1, clientHeight);
      if (
        canvas.width !== Math.floor(cssWidth * dpr) ||
        canvas.height !== Math.floor(cssHeight * dpr)
      ) {
        canvas.width = Math.floor(cssWidth * dpr);
        canvas.height = Math.floor(cssHeight * dpr);
      }
      canvas.style.width = cssWidth + "px";
      canvas.style.height = cssHeight + "px";

      ctx.save();
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      if (!selectedLayout) {
        ctx.restore();
        return;
      }

      const padding = 12;
      const { minX, minY, maxX, maxY } = computeBounds();
      const contentWidth = maxX - minX || 1;
      const contentHeight = maxY - minY || 1;
      const scale = Math.min(
        (cssWidth - padding * 2) / contentWidth,
        (cssHeight - padding * 2) / contentHeight
      );

      const offsetX =
        padding +
        (cssWidth - padding * 2 - contentWidth * scale) / 2 -
        minX * scale;
      const offsetY =
        padding +
        (cssHeight - padding * 2 - contentHeight * scale) / 2 -
        minY * scale;

      transformRef.current = { offsetX, offsetY, scale };

      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);

      ctx.lineWidth = 1 / scale;
      const activeBindings = keymap?.layers?.[0]?.bindings;
      for (let i = 0; i < selectedLayout.keys.length; i++) {
        const key = selectedLayout.keys[i];
        const w = key.width || 1;
        const h = key.height || 1;
        const x = key.x || 0;
        const y = key.y || 0;
        const rDeg = key.r || 0;
        const rx = key.rx ?? x + w / 2;
        const ry = key.ry ?? y + h / 2;
        const r = (rDeg * Math.PI) / 180;

        ctx.save();
        if (r) {
          ctx.translate(rx, ry);
          ctx.rotate(r);
          ctx.translate(-rx, -ry);
        }

        const isSelected = selectedKeyIndex === i;
        ctx.fillStyle = isSelected ? "#dbeafe" : "#f3f4f6"; // blue-100 : gray-100
        ctx.strokeStyle = isSelected ? "#3b82f6" : "#9ca3af"; // blue-500 : gray-400
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.fill();
        ctx.stroke();

        // Draw key legend (simple behavior id for now)
        const binding = activeBindings?.[i] as
          | { behaviorId?: number; param1?: number; param2?: number }
          | undefined;
        const label =
          binding && typeof binding.behaviorId === "number"
            ? String(binding.behaviorId)
            : "";
        if (label) {
          const fontSize = Math.max(0.3, Math.min(w, h) * 0.5);
          ctx.fillStyle = "#111827"; // gray-900
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = `${fontSize}px ui-sans-serif`;
          ctx.fillText(label, x + w / 2, y + h / 2);
        }
        ctx.restore();
      }

      ctx.restore();
    }

    function schedule() {
      if (scheduled) return;
      scheduled = true;
      frameId = window.requestAnimationFrame(draw);
    }

    const ro = new ResizeObserver(() => schedule());
    ro.observe(container);

    function pointInKey(
      px: number,
      py: number,
      key: {
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        r?: number;
        rx?: number;
        ry?: number;
      }
    ) {
      const w = key.width || 1;
      const h = key.height || 1;
      const x = key.x || 0;
      const y = key.y || 0;
      const rDeg = key.r || 0;
      const rx = key.rx ?? x + w / 2;
      const ry = key.ry ?? y + h / 2;
      const r = (rDeg * Math.PI) / 180;
      // inverse rotate the point around (rx, ry)
      const inv = rotatePoint(px, py, rx, ry, -r);
      return inv.x >= x && inv.x <= x + w && inv.y >= y && inv.y <= y + h;
    }

    function handleClick(ev: MouseEvent) {
      if (!selectedLayout) return;
      const rect = container.getBoundingClientRect();
      const mx = ev.clientX - rect.left;
      const my = ev.clientY - rect.top;

      const { offsetX, offsetY, scale } = transformRef.current;
      const lx = (mx - offsetX) / scale;
      const ly = (my - offsetY) / scale;

      let foundIndex: number | null = null;
      for (let i = selectedLayout.keys.length - 1; i >= 0; i--) {
        const key = selectedLayout.keys[i];
        if (pointInKey(lx, ly, key)) {
          foundIndex = i;
          break;
        }
      }

      setSelectedKeyIndex(foundIndex);
      schedule();
    }

    canvas.addEventListener("click", handleClick);

    schedule();

    return () => {
      if (frameId != null) window.cancelAnimationFrame(frameId);
      ro.disconnect();
      canvas.removeEventListener("click", handleClick);
    };
  }, [selectedLayout, selectedKeyIndex, keymap]);
  return (
    <div>
      <h1>Keyboard Meta</h1>
      <div>
        <div style={{ marginBottom: 12 }}>
          {selectedLayout ? (
            <div>
              <div style={{ marginBottom: 8 }}>{selectedLayout.name}</div>
              <div
                ref={containerRef}
                className="w-full h-80 rounded-lg border bg-card text-card-foreground shadow-sm"
              >
                <canvas ref={canvasRef} className="block w-full h-full" />
              </div>
            </div>
          ) : (
            <div>No physical layout available.</div>
          )}
        </div>
        <div>
          {keymap?.layers.map((layer) => (
            <div key={layer.id}>
              {layer.name} {layer.bindings.map((binding) => binding.behaviorId)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
