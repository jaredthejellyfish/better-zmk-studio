import { Separator } from "@/components/atoms/ui/separator";
import { Button } from "@/components/atoms/ui/button";
import {
  ConnectButton,
  type TransportFactory,
} from "@/components/organisms/connect-button";
import { ConnectionContext } from "@/lib/rpc/ConnectionContext";
import { LockStateContext } from "@/lib/rpc/LockStateContext";
import { useCurrentStep, useSetCurrentStep } from "@/lib/state/currentStep";
import { useKeyboardMetaStore } from "@/lib/state/keyboardMetaStore";
import { LockState } from "@zmkfirmware/zmk-studio-ts-client/core";
import { RpcTransport } from "@zmkfirmware/zmk-studio-ts-client/transport/index";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHead from "@/components/atoms/page-head";

const STEPS = [
  { id: 1 as const, label: "Connect" },
  { id: 2 as const, label: "Unlock" },
  { id: 3 as const, label: "Finish" },
];

function ConnectRoute({
  transports,
  onTransportCreated,
}: {
  transports: TransportFactory[];
  onTransportCreated: (transport: RpcTransport) => void;
}) {
  const currentStep = useCurrentStep();

  return (
    <main className="px-6 py-10 w-screen min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black">
      <PageHead
        title="Connect | better-zmk-studio"
        description="Connect your keyboard to better-zmk-studio using USB (or BLE on Linux)."
      />
      <div className="mx-auto max-w-3xl w-full" id="connect-page">
        <ol className="flex w-full items-center justify-between gap-4">
          {STEPS.map((step, idx) => {
            const isCurrent = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            return (
              <li
                key={step.id}
                className={[
                  "flex items-center gap-4",
                  idx < STEPS.length - 1 ? "flex-1" : "",
                ].join(" ")}
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="flex flex-col items-center relative">
                    <div
                      className={[
                        "flex h-11 w-11 items-center justify-center rounded-full border transition-all",
                        isCurrent
                          ? "border-amber-300 text-white ring-2 ring-amber-300/30 shadow-[0_0_0_4px_rgba(251,191,36,0.1)]"
                          : isCompleted
                            ? "border-emerald-400/70 text-emerald-300 bg-emerald-400/10"
                            : "border-white/20 text-white/60",
                      ].join(" ")}
                    >
                      <span className="text-base font-semibold">{step.id}</span>
                    </div>
                    <span className="absolute top-13 left-1/2 -translate-x-1/2 text-sm font-medium text-white/80">
                      {step.label}
                    </span>
                  </div>

                  {idx < STEPS.length - 1 && (
                    <Separator className="hidden sm:block flex-1 bg-gradient-to-r from-white/20 via-white/15 to-white/10 h-0.5 rounded-full" />
                  )}
                  {idx < STEPS.length - 1 && (
                    <div className="sm:hidden mx-3 h-px flex-1 bg-white/10" />
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
      {currentStep === 1 && (
        <ConnectStep
          transports={transports}
          onTransportCreated={onTransportCreated}
        />
      )}
      {currentStep === 2 && <AllowStep />}
      {currentStep === 3 && <GetStartedStep />}
    </main>
  );
}

function ConnectStep({
  transports,
  onTransportCreated,
}: {
  transports: TransportFactory[];
  onTransportCreated: (transport: RpcTransport) => void;
}) {
  const setCurrentStep = useSetCurrentStep();
  const conn = useContext(ConnectionContext);
  const lockState = useContext(LockStateContext);
  const navigate = useNavigate();
  const disableHomeRedirect = useRef(false);

  useEffect(() => {
    if (conn.conn) {
      if (disableHomeRedirect.current) return;
      navigate("/home");
    }
  }, [conn, lockState, setCurrentStep, navigate]);

  const wrappedTransportCreated = useCallback(
    (transport: RpcTransport) => {
      disableHomeRedirect.current = true;
      onTransportCreated(transport);
      setCurrentStep(2);
    },
    [onTransportCreated, setCurrentStep]
  );

  return (
    <section id="connect">
      <div className="mx-auto max-w-xl w-full mt-12">
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl">
          <div className="p-6 sm:p-8 flex flex-col items-center text-center">
            <h1 className="text-3xl font-semibold tracking-tight">
              Allow the browser to connect your device
            </h1>
            <p className="mt-2 text-sm text-white/70 max-w-prose">
              This opens a native device picker near your address bar. Choose
              your keyboard, then press
              <span className="px-1 font-medium text-white">Connect</span>.
            </p>
            <div className="mt-6">
              <ConnectButton
                transports={transports}
                onTransportCreated={wrappedTransportCreated}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AllowStep() {
  const conn = useContext(ConnectionContext);
  const lockState = useContext(LockStateContext);
  const setCurrentStep = useSetCurrentStep();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    setIsChecking(true);
    const timer = setTimeout(() => {
      if (
        conn.conn &&
        lockState == LockState.ZMK_STUDIO_CORE_LOCK_STATE_UNLOCKED
      ) {
        setCurrentStep(3);
      } else {
        setCurrentStep(2);
        setIsChecking(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [conn, lockState, setCurrentStep]);

  return (
    <section id="allow">
      <div className="mx-auto max-w-xl w-full mt-12">
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl">
          <div className="p-6 sm:p-8 flex flex-col items-center text-center">
            {isChecking ? (
              <>
                <div className="mb-3 inline-flex h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
                <h1 className="text-2xl font-semibold">Checking lock state…</h1>
                <p className="mt-1 text-sm text-white/70">
                  Please wait a moment.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-semibold">
                  better-zmk-studio unlock required
                </h1>
                <p className="mt-2 text-sm text-white/70 max-w-prose">
                  To continue, unlock better-zmk-studio using your keyboard's
                  unlock combo.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-amber-200">
                  <span className="h-2 w-2 rounded-full bg-amber-300 animate-pulse" />
                  <span className="text-xs tracking-wide">
                    Awaiting unlock…
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function GetStartedStep() {
  const portName = useKeyboardMetaStore((s) => s.portName);
  const deviceName = useKeyboardMetaStore((s) => s.deviceName);
  const serialNumber = useKeyboardMetaStore((s) => s.serialNumber);
  return (
    <section id="get-started">
      <div className="mx-auto max-w-xl w-full mt-12">
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl">
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl font-semibold">Get Started</h1>
            <p className="mt-1 text-sm text-white/70">
              You're connected. Here are your device details:
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="text-xs uppercase tracking-wide text-white/60">
                  Port
                </div>
                <div className="mt-1 text-sm font-medium text-white/90">
                  <pre>{portName?.replace(/,/g, "")}</pre>
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="text-xs uppercase tracking-wide text-white/60">
                  Device
                </div>
                <div className="mt-1 text-sm font-medium text-white/90">
                  <pre>{deviceName}</pre>
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="text-xs uppercase tracking-wide text-white/60">
                  Serial
                </div>
                <div className="mt-1 text-sm font-medium text-white/90">
                  <pre>{serialNumber}</pre>
                </div>
              </div>
            </div>
            <Link to="/" className="mt-6 block">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ConnectRoute;
