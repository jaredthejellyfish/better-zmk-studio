import React, { SetStateAction, useContext, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ConnectionContext } from "./ConnectionContext";

import { call_rpc } from "./logging";

import { Request, RequestResponse } from "@zmkfirmware/zmk-studio-ts-client";
import { LockStateContext } from "./LockStateContext";
import { LockState } from "@zmkfirmware/zmk-studio-ts-client/core";

export function useConnectedDeviceData<T>(
  req: Omit<Request, "requestId">,
  response_mapper: (resp: RequestResponse) => T | undefined,
  requireUnlock?: boolean
): [
  T | undefined,
  React.Dispatch<SetStateAction<T | undefined>>,
  boolean,
  Error | null,
] {
  const connection = useContext(ConnectionContext);
  const lockState = useContext(LockStateContext);
  const [dataOverride, setDataOverride] = useState<T | undefined>(undefined);

  const enabled = useMemo(() => {
    if (!connection.conn) return false;
    if (
      requireUnlock &&
      lockState !== LockState.ZMK_STUDIO_CORE_LOCK_STATE_UNLOCKED
    )
      return false;
    return true;
  }, [connection.conn, lockState, requireUnlock]);

  const queryKey = useMemo(
    () => ["connected-device-data", requireUnlock ? "unlocked" : "any", req],
    [req, requireUnlock]
  );

  const query = useQuery<T | undefined>({
    queryKey,
    enabled,
    queryFn: async () => {
      if (!connection.conn) return undefined;
      const resp = await call_rpc(connection.conn, req);
      return response_mapper(resp);
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const data = enabled ? (dataOverride ?? query.data) : undefined;
  const setData: React.Dispatch<SetStateAction<T | undefined>> =
    setDataOverride;

  return [data, setData, query.isLoading, query.error];
}
