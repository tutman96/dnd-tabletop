import React, { useState, useEffect } from 'react';
import { Stage } from 'react-konva';
import { Helmet } from 'react-helmet';

import { settingsDatabase, Settings, useTableResolution, useTablePPI } from '../settings';
import { sceneDatabase } from '../scene';
import { flattenLayer, LayerTypeToComponent } from '../scene/layer';
import TableViewOverlay from '../scene/layer/tableView';
import * as Types from '../protos/scene';

const { useOneValue } = sceneDatabase();
const { useOneValue: useOneSettingValue } = settingsDatabase();

type Props = {};
const TablePage: React.FunctionComponent<Props> = () => {
	const [displayedScene] = useOneSettingValue(Settings.DISPLAYED_SCENE);
	const [tableFreeze] = useOneSettingValue(Settings.TABLE_FREEZE);
	const [tableResolution] = useTableResolution();

	const [scene] = useOneValue(displayedScene as string);
	const [tableScene, setTableScene] = useState<Types.Scene | null>(null);

	const tablePPI = useTablePPI();

	useEffect(() => {
		if (scene === null || displayedScene === null) {
			setTableScene(null)
		}
		else if (!tableFreeze && scene !== undefined) {
			if (scene === null) setTableScene(null)
			else if (scene.version !== tableScene?.version) {
				setTableScene(scene);
			}
		}
	}, [displayedScene, scene, tableScene, tableFreeze])

	if (!tableResolution || !tablePPI) {
		return null;
	}

	return (
		<>
			<Helmet title="D&amp;D Table View" />
			{tableScene &&
				<Stage
					width={tableResolution.width}
					height={tableResolution.height}
					offsetX={tableScene.table!.offset!.x}
					offsetY={tableScene.table!.offset!.y}
					scaleX={tableScene.table!.scale * tablePPI}
					scaleY={tableScene.table!.scale * tablePPI}
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