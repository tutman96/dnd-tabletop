import React, { useState, useEffect } from 'react';
import { useSettingsDatabase, Settings } from '../settings';
import { useSceneDatabase, IScene } from '../scene';
import { Stage } from 'react-konva';
import { Global } from '@emotion/core';
import { Helmet } from 'react-helmet';
import { LayerTypeToComponent } from '../scene/layer';

const { useOneValue } = useSceneDatabase();
const { useOneValue: useOneSettingValue } = useSettingsDatabase();

type Props = {};
const TablePage: React.SFC<Props> = () => {
	const [displayedScene] = useOneSettingValue(Settings.DISPLAYED_SCENE);
	const [tableFreeze] = useOneSettingValue(Settings.TABLE_FREEZE);

	const [scene] = useOneValue(displayedScene as string);
	const [tableScene, setTableScene] = useState<IScene | null>();

	const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight })

	useEffect(() => {
		if (!tableFreeze && scene) {
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
					{...windowSize}
				>
					{
						tableScene.layers.map((layer) => {
							const Component = LayerTypeToComponent[layer.type];
							if (!Component) return null;
							return (
								<Component
									key={layer.id}
									layer={layer}
									onUpdate={() => { }}
									active={false}
								/>
							);
						})
					}
				</Stage>
			}
		</>
	)
}
export default TablePage;