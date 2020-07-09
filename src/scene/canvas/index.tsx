import React, { useState, useEffect, useCallback } from 'react';
import { Layer, Rect, Line } from 'react-konva';
import { useTheme } from 'sancho';

import { IScene } from '..';
import DraggableStage from './draggableStage';
import { useTableResolution, useTablePPI } from '../../settings';
import { Vector2d } from 'konva/types/types';
import { LayerTypeToComponent, LayerType, ILayer, createNewLayer } from '../layer';
import { deleteLayer } from '../layer';
import LayerList from './layerList';
import { ToolbarPortalProvider } from '../layer/toolbarPortal';

const TableViewOverlay: React.SFC<{ offset: Vector2d, rotation: number, showBorder: boolean, showGrid: boolean }> = ({ offset, rotation, showGrid, showBorder }) => {
	const theme = useTheme();
	const [tableResolution] = useTableResolution();
	const ppi = useTablePPI();

	if (!tableResolution || ppi === null) {
		return null;
	}

	const lines = new Array<{ start: Vector2d, end: Vector2d }>();

	if (showGrid) {
		for (let xOffset = 0; xOffset <= tableResolution.width; xOffset += ppi) {
			lines.push({
				start: { x: xOffset, y: 0 },
				end: { x: xOffset, y: tableResolution.height }
			})
		}

		for (let yOffset = 0; yOffset <= tableResolution.height; yOffset += ppi) {
			lines.push({
				start: { x: 0, y: yOffset },
				end: { x: tableResolution.width, y: yOffset }
			})
		}
	}

	return (
		<Layer>
			{lines.map((line, i) => (
				<Line
					key={i}
					x={offset.x}
					y={offset.y}
					rotation={rotation}
					points={[line.start.x, line.start.y, line.end.x, line.end.y]}
					stroke={theme.colors.palette.gray.dark}
					dash={[1, 1]}
					strokeWidth={1}
				/>
			))}
			{showBorder &&
				<Rect
					x={offset.x}
					y={offset.y}
					rotation={rotation}
					width={tableResolution.width}
					height={tableResolution.height}
					stroke={theme.colors.palette.gray.light}
					dash={[10, 10]}
					strokeWidth={5}
					listening={false}
				/>
			}
		</Layer>
	)
}

type Props = { scene: IScene, onUpdate: (scene: IScene) => void };
const Canvas: React.SFC<Props> = ({ scene, onUpdate }) => {
	const [activeLayer, setActiveLayer] = useState<string | null>(null);

	// Default selected layer to the first layer
	useEffect(() => {
		if (
			(activeLayer === null || !scene.layers.some((l) => l.id === activeLayer)) &&
			scene.layers.length
		) {
			setActiveLayer(scene.layers[0].id);
		}
	}, [activeLayer, scene])

	const onLayerUpdate = useCallback((updatedLayer: ILayer) => {
		const i = scene.layers.findIndex((l) => l.id === updatedLayer.id);
		scene.layers[i] = updatedLayer;
		onUpdate({ ...scene })
	}, [scene, onUpdate]);

	function addLayer(type: LayerType) {
		const layer = createNewLayer(type);
		layer.name = 'Layer ' + (scene.layers.length + 1);
		scene.layers.push(layer);
		onUpdate({ ...scene });
	}

	function editActiveLayerName(name: string) {
		const layer = scene.layers.find((l) => l.id === activeLayer);
		if (!layer) return;

		layer.name = name;
		onUpdate({
			...scene,
			layers: [...scene.layers]
		});
	}

	function moveActiveLayer(direction: 'up' | 'down') {
		const layerIndex = scene.layers.findIndex((l) => l.id === activeLayer);
		if (layerIndex !== -1) {
			const swapIndex = direction === 'up' ? layerIndex + 1 : layerIndex - 1;
			if (swapIndex > scene.layers.length - 1 || swapIndex < 0) {
				return;
			}

			const currentLayer = scene.layers[layerIndex];
			const layerToSwap = scene.layers[swapIndex];

			scene.layers[swapIndex] = currentLayer;
			scene.layers[layerIndex] = layerToSwap;

			onUpdate({
				...scene,
				layers: [...scene.layers]
			});
		}
	}

	async function deleteActiveLayer() {
		const layer = scene.layers.find((l) => l.id === activeLayer);
		if (layer) {
			const newScene = await deleteLayer(scene, layer);
			onUpdate({
				...newScene,
				layers: [...newScene.layers]
			});
			setActiveLayer(null);
		}
	}

	return (
		<ToolbarPortalProvider>
			{/* Canvas */}
			<DraggableStage>
				{
					scene.layers.map((layer) => {
						const Component = LayerTypeToComponent[layer.type];
						if (!Component) return null;
						return (
							<Component
								key={layer.id}
								layer={layer}
								onUpdate={onLayerUpdate}
								active={activeLayer === layer.id}
							/>
						);
					})
				}
				<TableViewOverlay offset={{ x: 0, y: 0 }} rotation={0} showGrid={true} showBorder={true} />
			</DraggableStage>

			<LayerList
				scene={scene}
				activeLayer={activeLayer}
				setActiveLayer={setActiveLayer}
				addLayer={addLayer}
				editActiveLayerName={editActiveLayerName}
				moveActiveLayer={moveActiveLayer}
				deleteActiveLayer={deleteActiveLayer}
			/>
		</ToolbarPortalProvider>
	);
}
export default Canvas;