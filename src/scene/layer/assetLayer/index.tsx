import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Layer } from "react-konva";
import Konva from 'konva';

import Box from '@mui/material/Box';

import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import GridOnOutlinedIcon from '@mui/icons-material/GridOnOutlined';
import GridOffOutlinedIcon from '@mui/icons-material/GridOffOutlined';

import { ILayerComponentProps } from '..';
import AssetComponent from './asset';
import { deleteAsset, getNewAssets } from '../../asset';
import ToolbarItem from '../toolbarItem';
import ToolbarPortal from '../toolbarPortal';
import AssetSizer, { calculateCalibratedTransform } from './assetSizer';
import { usePlayAudioOnTable } from '../../../settings';
import { calculateViewportCenter, calculateViewportDimensions } from '../../canvas';
import * as Types from '../../../protos/scene';

interface Props extends ILayerComponentProps<Types.AssetLayer> { }
const AssetLayer: React.FunctionComponent<Props> = ({ layer, onUpdate, active: layerActive, isTable }) => {
	const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
	const layerRef = useRef<Konva.Layer>();
	const [playAudioOnTable] = usePlayAudioOnTable();

	const deleteSelectedAsset = useCallback(async () => {
		if (selectedAssetId && layer.assets[selectedAssetId]) {
			const asset = layer.assets[selectedAssetId];
			delete layer.assets[selectedAssetId];
			await deleteAsset(asset);
			layer.assets = { ...layer.assets }
			onUpdate(layer);
			setSelectedAssetId(null);
		}
	}, [selectedAssetId, layer, onUpdate, setSelectedAssetId])

	// Animate the layer if there are any video assets
	useEffect(() => {
		if (!layerRef.current) return;
		if (!Object.values(layer.assets).some((asset) => asset.type === Types.AssetLayer_Asset_AssetType.VIDEO)) return;

		let previousUpdate = Date.now();
		const anim = new Konva.Animation(() => {
			const now = Date.now();
			// 10 FPS cap on DM display
			if (!isTable && now - previousUpdate < 100) return false;
			else previousUpdate = now;
			return true;
		}, layerRef.current);
		anim.start();
		return () => { anim.stop() }
	}, [layerRef, layer, isTable])

	useEffect(() => {
		if (!layerRef.current?.parent) return;
		const parent = layerRef.current.parent;

		function onParentClick() {
			if (selectedAssetId) {
				setSelectedAssetId(null);
			}
		}
		parent.on('click.konva', onParentClick);
		return () => { parent.off('click.konva', onParentClick) }
	}, [layerRef, selectedAssetId])

	// Reset selected asset when active layer changes
	useEffect(() => {
		if (!layerActive && selectedAssetId !== null) {
			setSelectedAssetId(null);
		}
	}, [layerActive, selectedAssetId])

	const toolbar = useMemo(() => {
		const selectedAsset = selectedAssetId ? layer.assets[selectedAssetId] : undefined;
		return (
			<>
				<ToolbarItem
					icon={<AddPhotoAlternateOutlinedIcon />}
					label="Add Asset"
					onClick={async () => {
						const assets = await getNewAssets();
						const viewportCenter = calculateViewportCenter(layerRef);
						const viewportDimensions = calculateViewportDimensions(layerRef);
						for (const asset of assets) {
							const aspectRatio = asset.size!.width / asset.size!.height;
							asset.transform!.height = viewportDimensions.height / 2;
							asset.transform!.width = asset.transform!.height * aspectRatio;
							asset.transform!.x = viewportCenter.x - (asset.transform!.width ?? 0) / 2;
							asset.transform!.y = viewportCenter.y - (asset.transform!.height ?? 0) / 2;
							layer.assets[asset.id] = asset;
						}
						layer.assets = { ...layer.assets };
						onUpdate(layer);
					}}
				/>
				<AssetSizer
					asset={selectedAsset}
					onUpdate={(asset) => {
						asset.transform = calculateCalibratedTransform(asset);
						layer.assets[asset.id] = asset;
						onUpdate(layer);
					}}
				/>
				<ToolbarItem
					label={!!selectedAsset?.snapToGrid ? 'Free Move' : 'Snap to Grid'}
					disabled={!selectedAsset}
					icon={!!selectedAsset?.snapToGrid ? <GridOffOutlinedIcon /> : <GridOnOutlinedIcon />}
					onClick={() => {
						if (!selectedAsset) return;
						selectedAsset.snapToGrid = !selectedAsset.snapToGrid;
						onUpdate(layer)
					}}
				/>
				<Box sx={{ flexGrow: 2 }} />
				<ToolbarItem
					icon={<DeleteOutlinedIcon />}
					label="Delete Asset"
					disabled={selectedAssetId === null}
					onClick={deleteSelectedAsset}
					keyboardShortcuts={['Delete', 'Backspace']}
				/>
			</>
		);
	}, [layer, layerRef, selectedAssetId, onUpdate, deleteSelectedAsset]);

	return (
		<>
			{layerActive && <ToolbarPortal>{toolbar}</ToolbarPortal>}
			<Layer
				ref={layerRef as any}
				listening={layerActive}
			>
				{
					Object.values(layer.assets)
						.map((asset) => {
							return (
								<AssetComponent
									key={asset.id}
									asset={asset}
									selected={layerActive && selectedAssetId === asset.id}
									onSelected={() => layerActive && setSelectedAssetId(asset.id)}
									onUpdate={(updatedAsset) => {
										layer.assets[updatedAsset.id] = updatedAsset;
										onUpdate(layer);
									}}
									playAudio={isTable && !!playAudioOnTable}
								/>
							);
						})
				}
			</Layer>
		</>
	);
}
export default AssetLayer;