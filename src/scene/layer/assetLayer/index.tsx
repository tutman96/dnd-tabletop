import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Layer } from "react-konva";
import AssetComponent from './asset';
import { IAsset, AssetType, deleteAsset, getNewAssets } from '../../asset';
import { ILayer, ILayerComponentProps } from '..';
import Konva from 'konva';
import { IconFilePlus, IconTrash2, IconRotateCcw, Check } from 'sancho';
import ToolbarItem from '../toolbarItem';
import ToolbarPortal from '../toolbarPortal';
import AssetSizer, { calculateCalibratedTransform } from './assetSizer';
import { css } from 'emotion';
import { useTablePPI } from '../../../settings';

export interface IAssetLayer extends ILayer {
	assets: Map<string, IAsset>
}

interface Props extends ILayerComponentProps<IAssetLayer> { }
const AssetLayer: React.SFC<Props> = ({ layer, onUpdate, active: layerActive }) => {
	const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
	const layerRef = useRef<Konva.Layer>();
	const tablePPI = useTablePPI();

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

		const anim = new Konva.Animation(() => { }, layerRef.current);
		anim.start();
		return () => { anim.stop() }
	}, [layerRef, layer])

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
						for (const asset of assets) {
							layer.assets.set(asset.id, asset);
						}
						onUpdate({ ...layer })
					}}
				/>
				<AssetSizer
					asset={selectedAsset}
					onUpdate={(asset) => {
						layer.assets.set(asset.id, asset);
						onUpdate({ ...layer });
					}}
				/>
				<ToolbarItem
					icon={<IconRotateCcw />}
					label="Reset Asset Size"
					disabled={!selectedAsset || !selectedAsset.calibration || !tablePPI}
					onClick={() => {
						selectedAsset!.transform = calculateCalibratedTransform(selectedAsset!, tablePPI!);
						layer.assets.set(selectedAsset!.id, selectedAsset!);
						onUpdate({
							...layer
						})
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
	}, [layer, tablePPI, selectedAssetId, onUpdate, deleteSelectedAsset]);

	return (
		<>
			{layerActive && <ToolbarPortal>{toolbar}</ToolbarPortal>}
			<Layer
				ref={layerRef as any}
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
								/>
							);
						})
				}
			</Layer>
		</>
	);
}
export default AssetLayer;