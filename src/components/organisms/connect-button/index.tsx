import { useCallback, useMemo, useState } from "react";

import type { RpcTransport } from "@zmkfirmware/zmk-studio-ts-client/transport/index";
import { UserCancelledError } from "@zmkfirmware/zmk-studio-ts-client/transport/errors";

import { Button, ButtonProps } from "@/components/atoms/ui/button";
import { toast } from "sonner";
import { useKeyboardMetaStore } from "@/lib/state/keyboardMetaStore";
import { useSetCurrentStep } from "@/lib/state/currentStep";

type AvailableDevice = { id: string; label: string };

export type TransportFactory = {
  label: string;
  isWireless?: boolean;
  connect?: () => Promise<RpcTransport>;
  pick_and_connect?: {
    list: () => Promise<Array<AvailableDevice>>;
    connect: (dev: AvailableDevice) => Promise<RpcTransport>;
  };
};

export interface ConnectModalProps {
  open?: boolean;
  transports: TransportFactory[];
  onTransportCreated: (t: RpcTransport) => void;
}

function NoTransports() {
  return (
    <div className="space-y-3">
      <p>
        Your browser is not supported. better-zmk-studio uses either {""}
        <a
          className="underline"
          href="https://caniuse.com/web-serial"
          target="_blank"
          rel="noreferrer"
        >
          Web Serial
        </a>{" "}
        or {""}
        <a
          className="underline"
          href="https://caniuse.com/web-bluetooth"
          target="_blank"
          rel="noreferrer"
        >
          Web Bluetooth
        </a>{" "}
        (Linux only) to connect to ZMK devices.
      </p>
      <div>
        <p>To use better-zmk-studio, either:</p>
        <ul className="list-disc list-inside">
          <li>
            Use a browser that supports the above web technologies, e.g.
            Chrome/Edge, or
          </li>
          <li>
            Download our {""}
            <a className="underline" href="/download">
              cross platform application
            </a>
            .
          </li>
        </ul>
      </div>
    </div>
  );
}

interface ConnectButtonProps extends ButtonProps {
  transports: TransportFactory[];
  onTransportCreated: (t: RpcTransport) => void;
}

export function ConnectButton({
  transports,
  onTransportCreated,
  ...props
}: ConnectButtonProps) {
  const setPortName = useKeyboardMetaStore((s) => s.setPortName);
  const [connecting, setConnecting] = useState(false);
  const setCurrentStep = useSetCurrentStep();

  const usbTransport = useMemo(() => {
    // Prefer an explicitly labeled USB transport; otherwise, any non-wireless with direct connect
    return (
      transports.find((t) => t.label === "USB" && t.connect) ||
      transports.find((t) => !t.isWireless && t.connect)
    );
  }, [transports]);

  const handleUsbConnect = useCallback(async () => {
    if (!usbTransport?.connect || connecting) return;
    setConnecting(true);
    try {
      const transport = await usbTransport.connect();
      if (transport) setPortName(transport.label ?? null);
      if (transport) onTransportCreated(transport);
      if (transport) setCurrentStep(2);
    } catch (e) {
      if (!(e instanceof UserCancelledError)) {
        toast.error(e instanceof Error ? e.message : String(e));
      }
    } finally {
      setConnecting(false);
    }
  }, [
    usbTransport,
    onTransportCreated,
    setPortName,
    setCurrentStep,
    connecting,
  ]);

  if (!usbTransport) {
    return <NoTransports />;
  }

  return (
    <Button
      type="button"
      onClick={handleUsbConnect}
      disabled={connecting}
      {...props}
    >
      {connecting ? "Connecting…" : "Connect via USB"}
    </Button>
  );
}
