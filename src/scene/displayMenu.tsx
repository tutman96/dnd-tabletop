import React, { useCallback } from 'react';

import Button from '@mui/material/Button'

import { useConnection, useConnectionState } from '../external/hooks';
import { ChannelState } from '../external/abstractChannel';

const DisplayMenu: React.FunctionComponent = () => {
  const connection = useConnection();
  const connectionState = useConnectionState();

  const connect = useCallback(async () => {
    await connection.connect()
  }, [connection])

  if (connectionState === ChannelState.CONNECTED) {
    return <Button onClick={() => connection.disconnect()}>Disconnect Local Display</Button>
  }

  if (connectionState === ChannelState.CONNECTING) {
    return <Button disabled>Connecting...</Button>
  }
  return <Button onClick={connect}>Open Local Display</Button>
}

export default DisplayMenu;