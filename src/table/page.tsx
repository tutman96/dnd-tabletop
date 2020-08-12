import React, { useState, useEffect } from 'react';
import { useSettingsDatabase, Settings, useTableResolution, useTablePPI } from '../settings';
import { useSceneDatabase, IScene } from '../scene';
import { Stage } from 'react-konva';
import { Global } from '@emotion/core';
import { Helmet } from 'react-helmet';
import { LayerTypeToComponent } from '../scene/layer';
import TableViewOverlay, { TableViewLayer } from '../scene/layer/tableView';
import { CurrentSceneContext } from '../scene/canvas';
import { css } from 'emotion';
import { BLUR_RADIUS } from '../scene/layer/fogLayer';

const { useOneValue } = useSceneDatabase();
const { useOneValue: useOneSettingValue } = useSettingsDatabase();

type Props = {};
const TablePage: React.SFC<Props> = () => {
	const [displayedScene] = useOneSettingValue(Settings.DISPLAYED_SCENE);
	const [tableFreeze] = useOneSettingValue(Settings.TABLE_FREEZE);
	const [tableResolution] = useTableResolution();

	const [scene] = useOneValue(displayedScene as string);
	const [tableScene, setTableScene] = useState<IScene | null>(null);

	const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight })
	const tablePPI = useTablePPI();

	const BLUR_OFFSET = (tablePPI || 100) * BLUR_RADIUS * 2;

	useEffect(() => {
		if (!tableFreeze && scene !== undefined) {
			setTableScene(scene);
		}
	}, [scene, tableFreeze])

	useEffect(() => {
		function onResize() {
			setWindowSize({ width: window.innerWidth, height: window.innerHeight });
		}
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize)
	}, [])

	if (!tableResolution) {
		return null;
	}

	return (
		<>
			<Global
				styles={{
					body: {
						background: 'black',
						margin: 0,
						padding: 0,
						overflow: 'hidden'
					}
				}}
			/>
			<Helmet title="D&amp;D Table View" />
			{tableScene &&
				<Stage
					width={windowSize.width + BLUR_OFFSET * 2}
					height={windowSize.width + BLUR_OFFSET * 2}
					offsetX={tableScene.table.offset.x - BLUR_OFFSET}
					offsetY={tableScene.table.offset.y - BLUR_OFFSET}
					scaleX={tableScene.table.scale}
					scaleY={tableScene.table.scale}
					className={css`
						position: relative;
						top: ${-BLUR_OFFSET}px;
						left: ${-BLUR_OFFSET}px;
					`}
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