import React, {useState, useEffect} from 'react';

import * as Types from '../protos/scene';
import * as ExternalTypes from '../protos/external';

import {
  useConnection,
  useConnectionState,
  useRequestHandler,
} from '../external/hooks';
import {ChannelState} from '../external/abstractChannel';
import {
  usePlayAudioOnTable,
  useTableResolution,
  useTableSize,
} from '../settings';
import TableCanvas from './canvas';
import WebRTCApiChannel from '../external/webrtcChannel';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Favicon from '../partials/favicon';

function useDisplayedScene() {
  const [scene, setScene] = useState<Types.Scene | null>(null);
  const [connection] = useConnection();
  const connectionState = useConnectionState();
  useEffect(() => {
    if (connectionState === ChannelState.DISCONNECTED) {
      connection.connect();
    }
  }, [connection, connectionState]);

  useRequestHandler(async request => {
    if (request.displaySceneRequest) {
      setScene(request.displaySceneRequest.scene!);
      return {
        ackResponse: {},
        getAssetResponse: undefined,
      };
    }
    return null;
  });

  return scene;
}

function useTableConfiguration():
  | ExternalTypes.GetTableConfigurationResponse
  | undefined {
  const [connection] = useConnection();
  const connectionState = useConnectionState();
  const [, setStoredTableResolution] = useTableResolution();
  const [, setStoredTableSize] = useTableSize();
  const [, setPlayAudioOnTable] = usePlayAudioOnTable();
  const [tableConfiguration, setTableConfiguration] =
    useState<ExternalTypes.GetTableConfigurationResponse>();

  useEffect(() => {
    if (tableConfiguration) return;

    if (connectionState === ChannelState.CONNECTED) {
      connection.request({getTableConfigurationRequest: {}}).then(res => {
        setTableConfiguration(res.getTableConfigurationResponse!);
        setStoredTableResolution(
          res.getTableConfigurationResponse!.resolution!
        );
        setStoredTableSize(res.getTableConfigurationResponse!.size);
        setPlayAudioOnTable(
          res.getTableConfigurationResponse!.playAudioOnTable
        );
      });
    }
  }, [
    connection,
    connectionState,
    tableConfiguration,
    setStoredTableResolution,
    setStoredTableSize,
    setPlayAudioOnTable,
  ]);

  return tableConfiguration;
}

type Props = {};
const NetworkPage: React.FunctionComponent<Props> = () => {
  const tableConfiguration = useTableConfiguration();
  const tableScene = useDisplayedScene();
  const [connection] = useConnection();
  const connectionState = useConnectionState();

  const webrtcChannel = connection as WebRTCApiChannel;

  if (tableConfiguration && connectionState === ChannelState.CONNECTED) {
    return (
      <TableCanvas
        tableConfiguration={tableConfiguration}
        tableScene={tableScene}
      />
    );
  } else if (connectionState === ChannelState.CONNECTING) {
    return (
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 300,
            textAlign: 'center',
          }}
        >
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                paddingBottom: 2,
              }}
            >
              <Favicon active sx={{marginRight: 1}} />
              <Typography variant="h5">Session Code</Typography>
            </Box>
            <Typography
              variant="overline"
              fontSize={48}
              sx={{fonFamily: 'monospace'}}
            >
              {webrtcChannel?.sessionId}
            </Typography>
            <br />
            <Typography variant="caption" sx={{opacity: 0.6}}>
              Navigate to the scene editor menu's display settings to connect to
              this display.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  } else {
    return <></>;
  }
};
export default NetworkPage;
