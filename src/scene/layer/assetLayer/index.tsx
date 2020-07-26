import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Layer } from "react-konva";
import AssetComponent from './asset';
import { IAsset, AssetType, deleteAsset, getNewAssets } from '../../asset';
import { ILayer, ILayerComponentProps } from '..';
import Konva from 'konva';
import { IconFilePlus, IconTrash2 } from 'sancho';
import ToolbarItem from '../toolbarItem';
import ToolbarPortal from '../toolbarPortal';

export interface IAssetComponentProps<T extends IAsset> {
	asset: T;
	onUpdate: (asset: T) => void;
	selected: boolean;
	onSelected: () => void;
}

export interface IAssetLayer extends ILayer {
	assets: Map<string, IAsset>
}

interface Props extends ILayerComponentProps<IAssetLayer> { }
const AssetLayer: React.SFC<Props> = ({ layer, onUpdate, active: layerActive }) => {
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

	const toolbar = useMemo(() => {
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
				<ToolbarItem
					icon={<IconTrash2 />}
					label="Delete Asset"
					disabled={selectedAsset === null}
					onClick={deleteSelectedAsset}
					keyboardShortcuts={['Delete', 'Backspace']}
				/>
			</>
		);
	}, [layer, selectedAsset, onUpdate, deleteSelectedAsset]);

	return (
		<>
			{layerActive && <ToolbarPortal>{toolbar}</ToolbarPortal>}
			<Layer ref={layerRef as any}>
				{
					Array.from(layer.assets.values())
						.map((asset) => {
							return (
								<AssetComponent
									key={asset.id}
									asset={asset}
									selected={layerActive && selectedAsset === asset.id}
									onSelected={() => layerActive && setSelectedAsset(asset.id)}
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