import React, { useState, useEffect } from 'react';
import { Stage } from 'react-konva';
import { Helmet } from 'react-helmet';

import { flattenLayer, LayerTypeToComponent } from '../scene/layer';
import TableViewOverlay from '../scene/layer/tableView';
import * as Types from '../protos/scene';
import * as ExternalTypes from '../protos/external';

import { useConnection, useConnectionState, useRequestHandler } from '../external/hooks';
import { ChannelState } from '../external/abstractChannel';
import { useTableResolution, useTableSize } from '../settings';

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
	const [tableConfiguration, setTableConfiguration] = useState<ExternalTypes.GetTableConfigurationResponse>();

	useEffect(() => {
		if (tableConfiguration) return;
		
		if (connectionState === ChannelState.CONNECTED) {
			connection.request({ getTableConfigurationRequest: {} }).then((res) => {
				setTableConfiguration(res.getTableConfigurationResponse!)
				setStoredTableResolution(res.getTableConfigurationResponse!.resolution!);
				setStoredTableSize(res.getTableConfigurationResponse!.size);
			})
		}
		else if (connectionState === ChannelState.CONNECTING) {
			connection.request({ helloRequest: {} })
		}
	}, [connection, connectionState, tableConfiguration, setStoredTableResolution, setStoredTableSize])

	return tableConfiguration;
}

type Props = {};
const TablePage: React.FunctionComponent<Props> = () => {
	const tableConfiguration = useTableConfiguration();
	const tableScene = useDisplayedScene();

	if (!tableConfiguration) {
		return null;
	}

	console.log(tableConfiguration.resolution)

	const theta = Math.atan(tableConfiguration.resolution!.height / tableConfiguration.resolution!.width);
	const widthInch = tableConfiguration.size * Math.cos(theta);
	// const heightInch = tableSize * Math.sin(theta);

	const ppi = tableConfiguration.resolution!.width / widthInch;

	return (
		<>
			<Helmet title="D&amp;D Table View" />
			{tableScene &&
				<Stage
					width={tableConfiguration.resolution!.width}
					height={tableConfiguration.resolution!.height}
					offsetX={tableScene.table!.offset!.x}
					offsetY={tableScene.table!.offset!.y}
					scaleX={tableScene.table!.scale * ppi}
					scaleY={tableScene.table!.scale * ppi}
				>
					{tableScene.layers.map(flattenLayer).map((layer) => {
						const Component = LayerTypeToComponent[layer.type];
						if (!Component || layer.visible === false) return null;
						return (
							<Component
								key={layer.id}
								isTable={true}
								layer={layer}
								onUpdate={() => { }}
								active={false}
							/>
						);
					})
					}
					<TableViewOverlay
						options={tableScene.table!}
						active={false}
						onUpdate={() => { }}
						showBorder={false}
						showGrid={tableScene.table!.displayGrid}
					/>
				</Stage>
			}
		</>
	)
}
export default TablePage;