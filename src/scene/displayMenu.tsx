import React, { useCallback } from 'react';

import Button from '@mui/material/Button'

import TabIcon from '@mui/icons-material/Tab'
import CancelPresentation from '@mui/icons-material/CancelPresentation'
import PresentToAll from '@mui/icons-material/PresentToAll'

import { useConnection, useConnectionState } from '../external/hooks';
import { ChannelState } from '../external/abstractChannel';

const FullscreenButton: React.FunctionComponent = () => {
  const connection = useConnection();
  const connectionState = useConnectionState();

  const connect = useCallback(async () => {
    await connection.connect()
  }, [connection])

  if (connectionState === ChannelState.CONNECTED) {
    return <Button onClick={() => connection.disconnect()} fullWidth color='warning' startIcon={<CancelPresentation />}>Disconnect Fullscreen Display</Button>
  }
  if (connectionState === ChannelState.CONNECTING) {
    return <Button disabled fullWidth>Connecting to Fullscreen...</Button>
  }
  return (
    <Button onClick={connect} startIcon={<PresentToAll />} fullWidth>Open Display Fullscreen</Button>
  );
}

const DisplayMenu: React.FunctionComponent = () => {
  return (
    <>
      <FullscreenButton />
      <Button href="#/table" target="_blank" startIcon={<TabIcon />} fullWidth>Open Display as Tab</Button>
    </>
  );
}

export default DisplayMenu;