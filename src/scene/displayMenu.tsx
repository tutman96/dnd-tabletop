import React, { useCallback } from 'react';

import Button from '@mui/material/Button'

import { useConnection, useConnectionState } from '../external/hooks';
import { ChannelState } from '../external/abstractChannel';
import Link from '@mui/material/Link';

const DisplayMenu: React.FunctionComponent = () => {
  const connection = useConnection();
  const connectionState = useConnectionState();

  const connect = useCallback(async () => {
    await connection.connect()
  }, [connection])

  if (connectionState === ChannelState.CONNECTED) {
    return <Button onClick={() => connection.disconnect()}>Disconnect Fullscreen Display</Button>
  }

  if (connectionState === ChannelState.CONNECTING) {
    return <Button disabled>Connecting...</Button>
  }
  return (
    <>
      <Link href="#/table" target="_blank" >Open Display as Tab</Link>
      <Button onClick={connect}>Open Fullscreen Display</Button>
    </>
  );
}

export default DisplayMenu;