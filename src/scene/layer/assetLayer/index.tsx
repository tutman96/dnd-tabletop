import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Layer } from "react-konva";
import ImageAsset from './imageAsset';
import VideoAsset from './videoAsset';
import { IAsset, AssetType, deleteAsset, getNewAssets } from '../../asset';
import { ILayer, ILayerComponentProps } from '..';
import Konva from 'konva';
import { IconFilePlus, IconTrash2 } from 'sancho';
import ToolbarItem from '../toolbarItem';

export interface IAssetComponentProps<T extends IAsset> {
	asset: T;
	onUpdate: (asset: T) => void;
	selected: boolean;
	onSelected: () => void;
}

export const AssetTypeToComponent = {
	[AssetType.IMAGE]: ImageAsset,
	[AssetType.VIDEO]: VideoAsset
} as { [type: string]: React.SFC<IAssetComponentProps<any>> }

export interface IAssetLayer extends ILayer {
	assets: Map<string, IAsset>
}

interface Props extends ILayerComponentProps<IAssetLayer> { }
const AssetLayer: React.SFC<Props> = ({ layer, onUpdate, active: layerActive, setToolbar }) => {
	const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
	const layerRef = useRef<Konva.Layer>();

	const deleteSelectedAsset = useCallback(async () => {
		if (selectedAsset && layer.assets.has(selectedAsset)) {
			const asset = layer.assets.get(selectedAsset)!;
			layer.assets.delete(selectedAsset);
			await deleteAsset(asset);
			onUpdate({ ...layer });
			setSelectedAsset(null);
		}
	}, [selectedAsset, layer, onUpdate, setSelectedAsset])

	// Animate the layer if there are any video assets
	useEffect(() => {
		if (!layerRef.current) return;
		if (!Array.from(layer.assets.values()).some((asset) => asset.type === AssetType.VIDEO)) return;

		const anim = new Konva.Animation(() => { }, layerRef.current);
		anim.start();
		return () => { anim.stop() }
	}, [layerRef, layer])

	// Reset selected asset when active layer changes
	useEffect(() => {
		if (!layerActive && selectedAsset !== null) {
			setSelectedAsset(null);
		}
	}, [layerActive, selectedAsset])

	const toolbar = useCallback(() => {
		return (<>
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
			<ToolbarItem
				icon={<IconTrash2 />}
				label="Delete Asset"
				disabled={selectedAsset === null}
				onClick={deleteSelectedAsset}
				keyboardShortcuts={['Delete', 'Backspace']}
			/>
		</>);
	}, [layer, selectedAsset, onUpdate, deleteSelectedAsset])

	// Set the toolbar items
	useEffect(() => {
		if (layerActive) {
			setToolbar(toolbar)
		}
	}, [layerActive, setToolbar, toolbar])

	return (
		<Layer ref={layerRef as any}>
			{
				Array.from(layer.assets.values())
					.map((asset) => {
						const Component = AssetTypeToComponent[asset.type];
						return (
							<Component
								key={asset.id}
								asset={asset}
								selected={layerActive && selectedAsset === asset.id}
								onSelected={() => setSelectedAsset(asset.id)}
								onUpdate={(updatedAsset) => {
									layer.assets.set(updatedAsset.id, updatedAsset);
									onUpdate({ ...layer });
								}}
							/>
						);
					})
			}
		</Layer>
	);
}
export default AssetLayer;