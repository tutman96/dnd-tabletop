import React, { useCallback, useState } from 'react';

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';

import TabIcon from '@mui/icons-material/Tab'
import CancelPresentation from '@mui/icons-material/CancelPresentation'
import PresentToAll from '@mui/icons-material/PresentToAll'
import LeakAdd from '@mui/icons-material/LeakAdd'
import LeakRemove from '@mui/icons-material/LeakRemove'

import { useConnection, useConnectionState } from '../external/hooks';
import { ChannelState } from '../external/abstractChannel';
import PresentationApiChannel from '../external/presentationApiChannel';
import WebRTCApiChannel from '../external/webrtcChannel';

const FullscreenButton: React.FunctionComponent = () => {
  const [connection, setConnection] = useConnection();
  const connectionState = useConnectionState();

  const connect = useCallback(async () => {
    const conn = new PresentationApiChannel();
    setConnection(conn);
    await conn.connect()
  }, [setConnection])

  if (connectionState !== ChannelState.DISCONNECTED && !(connection instanceof PresentationApiChannel)) {
    return <Button startIcon={<PresentToAll />} fullWidth disabled>Open Display Fullscreen</Button>
  }
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

const NetworkButton: React.FunctionComponent = () => {
  const [connection, setConnection] = useConnection();
  const [showDialog, setShowDialog] = useState(false);
  const [sessionCode, setSessionCode] = useState('');
  const connectionState = useConnectionState();

  const connect = useCallback(async () => {
    const conn = new WebRTCApiChannel();
    setConnection(conn);
    setShowDialog(true);
    setSessionCode('');
  }, [setConnection, setShowDialog, setSessionCode])

  const dialog = (
    <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
      <DialogTitle>
        Connect to Network Display
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Enter the session code shown on the Display
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Session Code"
          variant="standard"
          fullWidth
          value={sessionCode}
          onChange={(e) => setSessionCode(e.target.value.trim().toLocaleUpperCase())}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowDialog(false)}>Cancel</Button>
        <Button onClick={() => {
          (connection as WebRTCApiChannel).sessionId = sessionCode.trim();
          connection.connect();
          setShowDialog(false);
        }} autoFocus>OK</Button>
      </DialogActions>
    </Dialog>
  )

  let button: React.ReactElement;
  if (connectionState !== ChannelState.DISCONNECTED && !(connection instanceof WebRTCApiChannel)) {
    button = <Button onClick={connect} startIcon={<LeakAdd />} fullWidth disabled>Connect to Network Display</Button>
  } else if (connectionState === ChannelState.CONNECTED) {
    button = <Button onClick={() => connection.disconnect()} fullWidth color='warning' startIcon={<LeakRemove />}>Disconnect Network Display</Button>
  } else if (connectionState === ChannelState.CONNECTING) {
    button = <Button disabled fullWidth>Connecting to Network Display...</Button>
  } else {
    button = <Button onClick={connect} startIcon={<LeakAdd />} fullWidth>Connect to Network Display (beta)</Button>
  }
  return (
    <>
      {button}
      {dialog}
    </>
  );
}

const DisplayMenu: React.FunctionComponent = () => {
  return (
    <>
      <FullscreenButton />
      <Button href="#/table" target="_blank" startIcon={<TabIcon />} fullWidth>Open Display as Tab</Button>
      <Divider sx={{marginY: 2}}/>
      <NetworkButton />
    </>
  );
}

export default DisplayMenu;