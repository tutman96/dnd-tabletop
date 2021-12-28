import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { css } from 'emotion';
import Konva from 'konva';

import { IScene } from '..';
import DraggableStage from './draggableStage';
import { LayerTypeToComponent, ILayer, createNewLayer } from '../layer';
import LayerType from "../layer/layerType";
import { deleteLayer } from '../layer';
import LayerList from './layerList';
import { ToolbarPortalProvider } from '../layer/toolbarPortal';
import TableViewOverlay, { TableViewLayer } from '../layer/tableView';
import useComponentSize from '@rehooks/component-size';
import { useTableResolution } from '../../settings';

export const CurrentSceneContext = React.createContext<IScene | null>(null);
export function useCurrentScene() {
	return useContext(CurrentSceneContext);
}

export function calculateViewportCenter(layerRef: React.MutableRefObject<Konva.Layer | undefined>): Konva.Vector2d {
	if (layerRef.current) {
		const konvaStage = layerRef.current.parent!;
		const stageOffset = konvaStage.getAbsolutePosition();
		const stageSize = konvaStage.getSize();
		const stageZoom = konvaStage.getAbsoluteScale();
		return {
			x: (-stageOffset.x + stageSize.width / 2) / stageZoom.x,
			y: (-stageOffset.y + stageSize.height / 2) / stageZoom.y
		};
	}
	else {
		return {
			x: 0,
			y: 0
		}
	}
}

type Props = { scene: IScene, onUpdate: (scene: IScene) => void };
const Canvas: React.SFC<Props> = ({ scene, onUpdate }) => {
	const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
	const containerRef = useRef<HTMLDivElement>();
	const containerSize = useComponentSize(containerRef);
	const [tableResolution] = useTableResolution();

	// Default selected layer to the first layer
	useEffect(() => {
		if (activeLayerId === TableViewLayer.id) return;

		if (
			(activeLayerId === null || !scene.layers.some((l) => l.id === activeLayerId)) &&
			scene.layers.length
		) {
			setActiveLayerId(scene.layers[0].id);
		}
	}, [activeLayerId, scene])

	const onLayerUpdate = useCallback((updatedLayer: ILayer) => {
		const i = scene.layers.findIndex((l) => l.id === updatedLayer.id);
		scene.layers[i] = updatedLayer;
		onUpdate({ ...scene })
	}, [scene, onUpdate]);

	function addLayer(type: LayerType) {
		const layer = createNewLayer(type);
		layer.name = 'Layer ' + (scene.layers.length + 1);
		scene.layers.push(layer);
		setActiveLayerId(layer.id);
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
		const layer = scene.layers.find((l) => l.id === activeLayerId);
		if (!layer) return;

		layer.name = name;
		onUpdate({
			...scene,
			layers: [...scene.layers]
		});
	}

	function moveActiveLayer(direction: 'up' | 'down') {
		const layerIndex = scene.layers.findIndex((l) => l.id === activeLayerId);
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
		const layer = scene.layers.find((l) => l.id === activeLayerId);
		if (layer) {
			const newScene = await deleteLayer(scene, layer);
			onUpdate({
				...newScene,
				layers: [...newScene.layers]
			});
			setActiveLayerId(null);
		}
	}

	const initialZoom = tableResolution ?
		Math.min(
			containerSize.height / tableResolution.height,
			containerSize.width / tableResolution.width
		) :
		1;

	return (
		<>
			<ToolbarPortalProvider>
				<div
					ref={containerRef as any}
					className={css`
							display: flex;
							flex-grow: 2;
							height: 100%;
							`}
				>
					{containerSize.height !== 0 && tableResolution ? (
						<DraggableStage
							width={containerSize.width || 1}
							height={containerSize.height || 1}
							initialZoom={initialZoom}
						>
							<CurrentSceneContext.Provider value={scene}>
								{
									scene.layers.map((layer) => {
										const Component = LayerTypeToComponent[layer.type];
										if (!Component || layer.visible === false) return null;
										return (
											<Component
												key={layer.id}
												layer={layer}
												isTable={false}
												onUpdate={onLayerUpdate}
												active={activeLayerId === layer.id}
											/>
										);
									})
								}
								<TableViewOverlay
									layer={{
										...TableViewLayer,
										options: scene.table
									}}
									isTable={false}
									active={activeLayerId === TableViewLayer.id}
									onUpdate={(layer) => {
										onUpdate({
											...scene,
											table: layer.options
										})
									}}
									showBorder={true}
									showGrid={true}
								/>
							</CurrentSceneContext.Provider>
						</DraggableStage>
					) : null}
				</div>
			</ToolbarPortalProvider>

			<LayerList
				scene={scene}
				activeLayerId={activeLayerId}
				setActiveLayer={setActiveLayerId}
				updateLayer={updateLayer}
				addLayer={addLayer}
				editActiveLayerName={editActiveLayerName}
				moveActiveLayer={moveActiveLayer}
				deleteActiveLayer={deleteActiveLayer}
			/>
		</>
	);
}
export default Canvas;