import { v4 } from "uuid";

import useGlobalStorage from "../storage";
import { ILayer, createNewLayer } from "./layer";
import LayerType from "./layer/layerType";
import Konva from 'konva';
import { IAssetLayer } from "./layer/assetLayer";
import { deleteAsset } from "./asset";

export interface TableOptions {
	displayGrid: boolean,
	offset: Konva.Vector2d,
	rotation: number,
	scale: number,
}

export interface IScene {
	id: string;
	name: string;
	table: TableOptions,
	layers: Array<ILayer>;
}

const storage = useGlobalStorage<IScene>('scene');
export function useSceneDatabase() {
	return {
		...storage,
		deleteItem: async (key: string) => {
			const scene = await storage.storage.getItem(key);
			for (const layer of scene.layers) {
				if (layer.type !== LayerType.ASSETS) continue;

				for (const asset of Array.from((layer as IAssetLayer).assets.values())) {
					await deleteAsset(asset)
				}
			}

			await storage.deleteItem(key);
		}
	};
}

export function createNewScene(): IScene {
	const defaultLayer = createNewLayer(LayerType.ASSETS);
	defaultLayer.name = 'Layer 1';

	return {
		id: v4(),
		name: 'Untitled',
		table: {
			offset: { x: 0, y: 0 },
			rotation: 0,
			scale: 1,
			displayGrid: true
		},
		layers: [
			defaultLayer
		]
	};
}