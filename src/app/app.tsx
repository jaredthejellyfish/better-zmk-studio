import { useCallback, useContext, useEffect, useState } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// import ZmkConnect from "@/components/organisms/zmk-connect";

import {
  ConnectionContext,
  type ConnectionState,
} from "@/lib/rpc/ConnectionContext";
import { LockStateContext } from "@/lib/rpc/LockStateContext";
import { call_rpc } from "@/lib/rpc/logging";

import { create_rpc_connection } from "@zmkfirmware/zmk-studio-ts-client";
import type { RpcTransport } from "@zmkfirmware/zmk-studio-ts-client/transport/index";
import { connect as serial_connect } from "@zmkfirmware/zmk-studio-ts-client/transport/serial";
import { connect as gatt_connect } from "@zmkfirmware/zmk-studio-ts-client/transport/gatt";
import { LockState } from "@zmkfirmware/zmk-studio-ts-client/core";
import { Toaster } from "@/components/atoms/ui/sonner";
import { toast } from "sonner";
import { useKeyboardMetaStore } from "@/lib/state/keyboardMetaStore";
import Home from "@/app/routes/home";
import ConnectRoute from "@/app/routes/connect";
import { CurrentStepProvider } from "@/lib/state/currentStepContext";
import { TransportFactory } from "@/components/organisms/connect-button";

const TRANSPORTS: TransportFactory[] = (
  [
    "serial" in navigator
      ? { label: "USB", pick_and_connect: undefined, connect: serial_connect }
      : undefined,
    "bluetooth" in navigator && navigator.userAgent.indexOf("Linux") >= 0
      ? {
          label: "BLE",
          isWireless: true,
          pick_and_connect: undefined,
          connect: gatt_connect,
        }
      : undefined,
  ] as Array<TransportFactory | undefined>
).filter((t): t is TransportFactory => Boolean(t));

function App() {
  const [conn, setConn] = useState<ConnectionState>({ conn: null });
  const [lockState, setLockState] = useState<LockState>(
    LockState.ZMK_STUDIO_CORE_LOCK_STATE_LOCKED
  );
  const setPortName = useKeyboardMetaStore((s) => s.setPortName);
  const setDeviceName = useKeyboardMetaStore((s) => s.setDeviceName);
  const setSerialNumber = useKeyboardMetaStore((s) => s.setSerialNumber);

  const onConnect = useCallback(
    (t: RpcTransport) => {
      const ac = new AbortController();
      void (async () => {
        try {
          // Set port/transport label immediately
          setPortName(t.label ?? null);

          const rpc = await create_rpc_connection(t, { signal: ac.signal });
          const details = await call_rpc(rpc, { core: { getDeviceInfo: true } })
            .then(
              (r) =>
                (
                  r as {
                    core?: {
                      getDeviceInfo?: {
                        name?: string;
                        serialNumber?: Uint8Array;
                      };
                    };
                  }
                )?.core?.getDeviceInfo
            )
            .catch(() => undefined);
          if (!details) {
            toast.error("Failed to connect to the chosen device");
            setDeviceName(null);
            setSerialNumber(null);
            return;
          }

          // Save device name and serial number
          setDeviceName(details.name ?? null);
          const serialHex = details.serialNumber
            ? Array.from(details.serialNumber)
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("")
            : null;
          setSerialNumber(serialHex);
          setConn({ conn: rpc });
        } catch (e) {
          toast.error(e instanceof Error ? e.message : String(e));
          setPortName(null);
          setDeviceName(null);
          setSerialNumber(null);
        }
      })();
    },
    [setPortName, setDeviceName, setSerialNumber]
  );

  useEffect(() => {
    if (!conn.conn) {
      setLockState(LockState.ZMK_STUDIO_CORE_LOCK_STATE_LOCKED);
      return;
    }
    let cancelled = false;
    (async () => {
      const resp = await call_rpc(conn.conn!, { core: { getLockState: true } });
      const ls =
        resp.core?.getLockState ?? LockState.ZMK_STUDIO_CORE_LOCK_STATE_LOCKED;
      if (!cancelled) setLockState(ls);
    })();
    return () => {
      cancelled = true;
    };
  }, [conn]);

  return (
    <ConnectionContext.Provider value={conn}>
      <LockStateContext.Provider value={lockState}>
        <Routes>
          <Route element={<RequireConnection />}>
            <Route path="/" element={<Home />} />
            <Route path="/settings" element={<div>Settings</div>} />
          </Route>
          <Route
            path="/connect"
            element={
              <CurrentStepProvider>
                <ConnectRoute
                  transports={TRANSPORTS}
                  onTransportCreated={onConnect}
                />
              </CurrentStepProvider>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Toaster />
      </LockStateContext.Provider>
    </ConnectionContext.Provider>
  );
}

export default App;

function RequireConnection() {
  const connection = useContext(ConnectionContext);
  if (!connection.conn) {
    return <Navigate to="/connect" replace />;
  }
  return <Outlet />;
}
