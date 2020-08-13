import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Layer } from "react-konva";
import AssetComponent from './asset';
import { IAsset, AssetType, deleteAsset, getNewAssets } from '../../asset';
import { ILayer, ILayerComponentProps } from '..';
import Konva from 'konva';
import { IconFilePlus, IconTrash2, Check } from 'sancho';
import ToolbarItem from '../toolbarItem';
import ToolbarPortal from '../toolbarPortal';
import AssetSizer, { calculateCalibratedTransform } from './assetSizer';
import { css } from 'emotion';
import { useTablePPI, usePlayAudioOnTable } from '../../../settings';
import { calculateViewportCenter } from '../../canvas';

export interface IAssetLayer extends ILayer {
	assets: Map<string, IAsset>
}

interface Props extends ILayerComponentProps<IAssetLayer> { }
const AssetLayer: React.SFC<Props> = ({ layer, onUpdate, active: layerActive, isTable }) => {
	const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
	const layerRef = useRef<Konva.Layer>();
	const tablePPI = useTablePPI();
	const [playAudioOnTable] = usePlayAudioOnTable();

	const deleteSelectedAsset = useCallback(async () => {
		if (selectedAssetId && layer.assets.has(selectedAssetId)) {
			const asset = layer.assets.get(selectedAssetId)!;
			layer.assets.delete(selectedAssetId);
			await deleteAsset(asset);
			onUpdate({ ...layer });
			setSelectedAssetId(null);
		}
	}, [selectedAssetId, layer, onUpdate, setSelectedAssetId])

	// Animate the layer if there are any video assets
	useEffect(() => {
		if (!layerRef.current) return;
		if (!Array.from(layer.assets.values()).some((asset) => asset.type === AssetType.VIDEO)) return;

		let previousUpdate = Date.now();
		const anim = new Konva.Animation(() => {
			const now = Date.now();
			// 10 FPS cap on DM display
			if (!isTable && now - previousUpdate < 100) return false;
			else previousUpdate = now;
		}, layerRef.current);
		anim.start();
		return () => { anim.stop() }
	}, [layerRef, layer, isTable])

	useEffect(() => {
		if (!layerRef.current?.parent) return;
		const parent = layerRef.current.parent;

		function onParentClick() {
			setSelectedAssetId(null);
		}
		parent.on('click.konva', onParentClick);
		return () => { parent.off('click.konva', onParentClick) }
	}, [layerRef, setSelectedAssetId])

	// Reset selected asset when active layer changes
	useEffect(() => {
		if (!layerActive && selectedAssetId !== null) {
			setSelectedAssetId(null);
		}
	}, [layerActive, selectedAssetId])

	const toolbar = useMemo(() => {
		const selectedAsset = Array.from(layer.assets.values()).find((a) => a.id === selectedAssetId);
		return (
			<>
				<ToolbarItem
					icon={<IconFilePlus />}
					label="Add Asset"
					onClick={async () => {
						const assets = await getNewAssets();
						const viewportCenter = calculateViewportCenter(layerRef);
						for (const asset of assets) {
							asset.transform.x = viewportCenter.x - asset.transform.width / 2;
							asset.transform.y = viewportCenter.y - asset.transform.height / 2;
							layer.assets.set(asset.id, asset);
						}
						onUpdate({ ...layer })
					}}
				/>
				<AssetSizer
					asset={selectedAsset}
					onUpdate={(asset) => {
						asset.transform = calculateCalibratedTransform(asset, tablePPI!);
						layer.assets.set(asset.id, asset);
						onUpdate({ ...layer });
					}}
				/>
				<Check label="Snap to Grid" disabled={!selectedAsset} checked={!!selectedAsset?.snapToGrid} onChange={(e) => {
					selectedAsset!.snapToGrid = e.target.checked;
					onUpdate({
						...layer
					})
				}} />
				<div className={css`flex-grow: 2;`} />
				<ToolbarItem
					icon={<IconTrash2 />}
					label="Delete Asset"
					disabled={selectedAssetId === null}
					onClick={deleteSelectedAsset}
					keyboardShortcuts={['Delete', 'Backspace']}
				/>
			</>
		);
	}, [layer, layerRef, tablePPI, selectedAssetId, onUpdate, deleteSelectedAsset]);

	return (
		<>
			{layerActive && <ToolbarPortal>{toolbar}</ToolbarPortal>}
			<Layer
				ref={layerRef as any}
				listening={layerActive}
			>
				{
					Array.from(layer.assets.values())
						.map((asset) => {
							return (
								<AssetComponent
									key={asset.id}
									asset={asset}
									selected={layerActive && selectedAssetId === asset.id}
									onSelected={() => layerActive && setSelectedAssetId(asset.id)}
									onUpdate={(updatedAsset) => {
										layer.assets.set(updatedAsset.id, updatedAsset);
										onUpdate({ ...layer });
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