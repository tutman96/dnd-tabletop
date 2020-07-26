import AssetLayer, { IAssetLayer } from "./assetLayer";
import { v4 } from "uuid";
import { IScene } from "..";
import { deleteAsset } from "../asset";

export enum LayerType {
	ASSETS,
	FOG,
	TABLE_VIEW,
}

export interface ILayer {
	id: string
	type: LayerType
	name: string
	visible: boolean
}

export interface ILayerComponentProps<T extends ILayer = ILayer> {
	layer: T;
	onUpdate: (layer: T) => void;
	active: boolean;
}

export const LayerTypeToComponent = {
	[LayerType.ASSETS]: AssetLayer,
} as { [type: string]: React.SFC<ILayerComponentProps<any>> }

export function createNewLayer(type: LayerType) {
	const layer: ILayer = {
		id: v4(),
		name: 'Untitled',
		type: type,
		visible: true
	};
	if (type === LayerType.ASSETS) {
		(layer as IAssetLayer).assets = new Map();
	}
	return layer;
}

export async function deleteLayer(scene: IScene, layer: ILayer) {
	const i = scene.layers.indexOf(layer);
	if (i === -1) return scene;
	if (layer.type === LayerType.ASSETS) {
		for (const asset of Array.from((layer as IAssetLayer).assets.values())) {
			await deleteAsset(asset);
		}
	}
	scene.layers.splice(i, 1);
	return scene;
}
// delete layer w/ assets