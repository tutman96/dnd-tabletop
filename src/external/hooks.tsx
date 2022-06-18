import { useEffect, useContext, createContext, useState } from "react";
import AbstractChannel from "./abstractChannel";
import PresentationApiChannel from "./presentationApiChannel";
import { Request, Response } from '../protos/external';

export const connectionContext = createContext<AbstractChannel>(new PresentationApiChannel())

export function useConnection() {
  return useContext(connectionContext);
}

export function useConnectionState() {
  const connection = useConnection();
  const [state, setState] = useState(connection.state);

  useEffect(() => {
    return connection.addConnectionStateChangeHandler(() => {
      setState(connection.state);
    })
  }, [connection])

  return state;
}

export function useRequestHandler(handler: (request: Request) => Promise<Partial<Response> | null>) {
  const connection = useConnection();

  useEffect(() => {
    return connection.addRequestHandler(handler)
  }, [connection, handler])
}