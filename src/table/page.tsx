import React, { useState, useEffect } from 'react';
import { settingsDatabase, Settings, useTableResolution, useTablePPI } from '../settings';
import { sceneDatabase, IScene } from '../scene';
import { Stage } from 'react-konva';
import { Helmet } from 'react-helmet';
import { LayerTypeToComponent } from '../scene/layer';
import TableViewOverlay, { TableViewLayer } from '../scene/layer/tableView';
import { CurrentSceneContext } from '../scene/canvas';

const { useOneValue } = sceneDatabase();
const { useOneValue: useOneSettingValue } = settingsDatabase();

type Props = {};
const TablePage: React.FunctionComponent<Props> = () => {
	const [displayedScene] = useOneSettingValue(Settings.DISPLAYED_SCENE);
	const [tableFreeze] = useOneSettingValue(Settings.TABLE_FREEZE);
	const [tableResolution] = useTableResolution();

	const [scene] = useOneValue(displayedScene as string);
	const [tableScene, setTableScene] = useState<IScene | null>(null);

	const tablePPI = useTablePPI();

	useEffect(() => {
		if (!tableFreeze && scene !== undefined) {
			if (scene === null) setTableScene(null)
			else if (scene.version !== tableScene?.version) {
				setTableScene(scene);
			}
		}
	}, [scene, tableScene, tableFreeze])

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
					offsetX={tableScene.table.offset.x}
					offsetY={tableScene.table.offset.y}
					scaleX={tableScene.table.scale * tablePPI}
					scaleY={tableScene.table.scale * tablePPI}
				>
					<CurrentSceneContext.Provider value={tableScene}>
						{
							tableScene.layers.map((layer) => {
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
							layer={{
								...TableViewLayer,
								options: tableScene.table
							}}
							isTable={true}
							active={false}
							onUpdate={() => { }}
							showBorder={false}
							showGrid={tableScene.table.displayGrid}
						/>
					</CurrentSceneContext.Provider>
				</Stage>
			}
		</>
	)
}
export default TablePage;