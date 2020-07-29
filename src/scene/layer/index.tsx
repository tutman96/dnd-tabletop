import AssetLayer, { IAssetLayer } from "./assetLayer";
import { v4 } from "uuid";
import { IScene } from "..";
import { deleteAsset } from "../asset";
import FogLayer, { IFogLayer } from "./fogLayer";

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
	isTable: boolean;
	onUpdate: (layer: T) => void;
	active: boolean;
}

export const LayerTypeToComponent = {
	[LayerType.ASSETS]: AssetLayer,
	[LayerType.FOG]: FogLayer
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
	else if (type === LayerType.FOG) {
		(layer as IFogLayer).obstructionPolygons = [];
		(layer as IFogLayer).lightSources = [];
		(layer as IFogLayer).fogPolygons = [];
		(layer as IFogLayer).fogClearPolygons = [];
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