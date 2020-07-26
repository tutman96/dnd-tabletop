import React, { useState, useEffect, useCallback } from 'react';

import { IScene } from '..';
import DraggableStage from './draggableStage';
import { LayerTypeToComponent, LayerType, ILayer, createNewLayer } from '../layer';
import { deleteLayer } from '../layer';
import LayerList from './layerList';
import { ToolbarPortalProvider } from '../layer/toolbarPortal';
import TableViewOverlay from './TableViewOverlay';

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

	function updateLayer(layer: ILayer) {
		const index = scene.layers.findIndex((l) => l.id === layer.id);
		scene.layers[index] = layer;
		onUpdate({
			...scene,
			layers: [...scene.layers]
		});
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
						if (!Component || layer.visible === false) return null;
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
				<TableViewOverlay offset={scene.table.offset} rotation={0} showGrid={scene.table.displayGrid} showBorder={true} />
			</DraggableStage>

			<LayerList
				scene={scene}
				activeLayer={activeLayer}
				setActiveLayer={setActiveLayer}
				updateLayer={updateLayer}
				addLayer={addLayer}
				editActiveLayerName={editActiveLayerName}
				moveActiveLayer={moveActiveLayer}
				deleteActiveLayer={deleteActiveLayer}
			/>
		</ToolbarPortalProvider>
	);
}
export default Canvas;