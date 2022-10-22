import { useEffect, useState } from "react";
import { singletonHook } from 'react-singleton-hook';
import { Request, Response } from '../protos/external';
import AbstractChannel from './abstractChannel';
import PresentationApiChannel from './presentationApiChannel';
import WebRTCApiChannel from './webrtcChannel';

const isTable = window.location.hash.substring(2).startsWith('table/');
const isNetworkTable = window.location.hash.substring(2) === 'table/network';

const init = isTable && isNetworkTable ? new WebRTCApiChannel() : new PresentationApiChannel();
export const useConnection = singletonHook([init, () => {}], () => {
  return useState<AbstractChannel>(init);
});

export function useConnectionState() {
  const [connection] = useConnection();
  const [state, setState] = useState(connection.state);

  useEffect(() => {
    return connection.addConnectionStateChangeHandler(() => {
      setState(connection.state);
    })
  }, [connection])

  return state;
}

export function useRequestHandler(handler: (request: Request) => Promise<Partial<Response> | null>) {
  const [connection] = useConnection();

  useEffect(() => {
    return connection.addRequestHandler(handler)
  }, [connection, handler])
}