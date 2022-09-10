import React, { useState, useEffect } from 'react';

import * as Types from '../protos/scene';
import * as ExternalTypes from '../protos/external';

import { useConnection, useConnectionState, useRequestHandler } from '../external/hooks';
import { ChannelState } from '../external/abstractChannel';
import { usePlayAudioOnTable, useTableResolution, useTableSize } from '../settings';
import TableCanvas from './canvas';

function useDisplayedScene() {
	const [scene, setScene] = useState<Types.Scene | null>(null);
	const connection = useConnection();
	useEffect(() => {
		connection.connect().then(() => console.log('connected'))
		return () => { connection.disconnect() }
	}, [connection])

	useRequestHandler(async (request) => {
		if (request.displaySceneRequest) {
			setScene(request.displaySceneRequest.scene!);
			return {
				ackResponse: {},
				getAssetResponse: undefined
			}
		}
		return null;
	})

	return scene;
}

function useTableConfiguration(): ExternalTypes.GetTableConfigurationResponse | undefined {
	const connection = useConnection();
	const connectionState = useConnectionState();
	const [, setStoredTableResolution] = useTableResolution();
	const [, setStoredTableSize] = useTableSize();
	const [, setPlayAudioOnTable] = usePlayAudioOnTable();
	const [tableConfiguration, setTableConfiguration] = useState<ExternalTypes.GetTableConfigurationResponse>();

	useEffect(() => {
		if (tableConfiguration) return;
		
		if (connectionState === ChannelState.CONNECTED) {
			connection.request({ getTableConfigurationRequest: {} }).then((res) => {
				setTableConfiguration(res.getTableConfigurationResponse!)
				setStoredTableResolution(res.getTableConfigurationResponse!.resolution!);
				setStoredTableSize(res.getTableConfigurationResponse!.size);
				setPlayAudioOnTable(res.getTableConfigurationResponse!.playAudioOnTable);
			})
		}
		else if (connectionState === ChannelState.CONNECTING) {
			connection.request({ helloRequest: {} })
		}
	}, [connection, connectionState, tableConfiguration, setStoredTableResolution, setStoredTableSize, setPlayAudioOnTable])

	return tableConfiguration;
}

type Props = {};
const PresentationPage: React.FunctionComponent<Props> = () => {
	const tableConfiguration = useTableConfiguration();
	const tableScene = useDisplayedScene();

	if (!tableConfiguration) {
		return null;
	}

	return (
		<TableCanvas tableConfiguration={tableConfiguration} tableScene={tableScene} />
	)
}
export default PresentationPage;

