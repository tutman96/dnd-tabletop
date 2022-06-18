import React, { useState, useEffect, useCallback, useRef } from 'react';
import Konva from 'konva';
import useComponentSize from '@rehooks/component-size';

import Box from '@mui/material/Box'

import DraggableStage from './draggableStage';
import { LayerTypeToComponent, ILayer, createNewLayer, flattenLayer, unflattenLayer } from '../layer';
import { deleteLayer } from '../layer';
import LayerList from './layerList';
import TableViewOverlay, { TABLEVIEW_LAYER_ID } from '../layer/tableView';
import { useTableDimensions } from '../../settings';
import * as Types from '../../protos/scene';

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

export function calculateViewportDimensions(layerRef: React.MutableRefObject<Konva.Layer | undefined>) {
	if (layerRef.current) {
		const konvaStage = layerRef.current.parent!;
		const stageSize = konvaStage.getSize();
		const stageZoom = konvaStage.getAbsoluteScale();
		return {
			width: stageSize.width / stageZoom.x,
			height: stageSize.height / stageZoom.y
		};
	}
	else {
		return {
			width: 0,
			height: 0
		}
	}
}

type Props = { scene: Types.Scene, onUpdate: (scene: Types.Scene) => void };
const Canvas: React.FunctionComponent<Props> = ({ scene, onUpdate }) => {
	const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
	const containerRef = useRef<HTMLDivElement>();
	const containerSize = useComponentSize(containerRef);
	const tableDimensions = useTableDimensions();
	const layers = scene.layers.map(flattenLayer);

	// Default selected layer to the first layer
	useEffect(() => {
		if (activeLayerId === TABLEVIEW_LAYER_ID) return;

		if (
			(activeLayerId === null || !layers.some((l) => l.id === activeLayerId)) && layers.length
		) {
			setActiveLayerId(layers[0].id);
		}
	}, [activeLayerId, layers])

	const onLayerUpdate = useCallback((updatedLayer: ILayer) => {
		const i = layers.findIndex((l) => l.id === updatedLayer.id);
		scene.layers[i] = unflattenLayer(updatedLayer)
		onUpdate(scene)
	}, [scene, layers, onUpdate]);

	const addLayer = useCallback((type: Types.Layer_LayerType) => {
		const layer = createNewLayer(type);
		layer.name = 'Layer ' + (layers.length + 1);
		scene.layers.push(unflattenLayer(layer));
		setActiveLayerId(layer.id);
		onUpdate(scene);
	}, [layers.length, onUpdate, scene])

	const updateLayer = useCallback((layer: ILayer) => {
		const index = layers.findIndex((l) => l.id === layer.id);
		scene.layers[index] = unflattenLayer(layer);
		onUpdate(scene);
	}, [layers, onUpdate, scene])

	const editActiveLayerName = useCallback((name: string) => {
		const layer = scene.layers.map(flattenLayer).find((l) => l.id === activeLayerId);
		if (!layer) return;

		layer.name = name;
		onUpdate(scene);
	}, [activeLayerId, onUpdate, scene])

	const moveActiveLayer = useCallback((direction: 'up' | 'down') => {
		const layerIndex = layers.findIndex((l) => l.id === activeLayerId);
		if (layerIndex !== -1) {
			const swapIndex = direction === 'up' ? layerIndex + 1 : layerIndex - 1;
			if (swapIndex > scene.layers.length - 1 || swapIndex < 0) {
				return;
			}

			const currentLayer = scene.layers[layerIndex];
			const layerToSwap = scene.layers[swapIndex];

			scene.layers[swapIndex] = currentLayer;
			scene.layers[layerIndex] = layerToSwap;
			scene.layers = Array.from(scene.layers);

			onUpdate(scene);
		}
	}, [activeLayerId, layers, onUpdate, scene])

	const deleteActiveLayer = useCallback(async () => {
		const layer = scene.layers.map(flattenLayer).find((l) => l.id === activeLayerId);
		if (layer) {
			const newScene = await deleteLayer(scene, layer);
			onUpdate(newScene);
			setActiveLayerId(null);
		}
	}, [activeLayerId, onUpdate, scene])

	const initialZoom = tableDimensions ?
		Math.min(
			containerSize.height / tableDimensions.height,
			containerSize.width / tableDimensions.width
		) :
		1;

	return (
		<>
			<Box
				ref={containerRef as any}
				sx={{
					display: 'flex',
					flexGrow: 2,
					height: '100%'
				}}
			>
				{containerSize.height !== 0 && tableDimensions ? (
					<DraggableStage
						width={containerSize.width || 1}
						height={containerSize.height || 1}
						initialZoom={initialZoom}
					>
						{
							scene.layers.map(flattenLayer).map((layer) => {
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
							options={scene.table!}
							active={activeLayerId === TABLEVIEW_LAYER_ID}
							onUpdate={(options) => {
								onUpdate({
									...scene,
									table: options
								})
							}}
							showBorder={true}
							showGrid={true}
						/>
					</DraggableStage>
				) : null}
			</Box>

			<LayerList
				layers={layers}
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