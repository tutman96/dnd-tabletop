import { v4 } from "uuid";

import globalStorage from "../storage";
import { ILayer, createNewLayer } from "./layer";
import LayerType from "./layer/layerType";
import Konva from 'konva';
import { IAssetLayer } from "./layer/assetLayer";
import { deleteAsset } from "./asset";
import { migrate, newSceneFromOldScene, oldSceneFromNewScene } from "./migrate";
import { Scene } from "../protos/scene";

export interface TableOptions {
	displayGrid: boolean,
	offset: Konva.Vector2d,
	rotation: number,
	scale: number,
}

export interface IScene {
	id: string;
	name: string;
	version: number;
	table: TableOptions,
	layers: Array<ILayer>;
}

export const oldStorage = globalStorage<IScene>('scene');
export const newStorage = globalStorage<Uint8Array>('scene_2')



export function sceneDatabase() {
	return {
		...oldStorage,
		useAllValues: () => {
			const oldValues = oldStorage.useAllValues();
			const newValues = newStorage.useAllValues();

			if (oldValues === undefined || newValues === undefined) {
				return undefined;
			}

			if (newValues.size < oldValues.size) {
				migrate();
				return undefined;
			}

			return new Map(
				Array.from(newValues.entries())
					.map(([sceneId, buf]) => [sceneId, oldSceneFromNewScene(Scene.decode(buf))])
			)
		},
		useOneValue: (key: string): [IScene | null | undefined, (newData: IScene) => Promise<void>] => {
			const [oldValue, setOldValue] = oldStorage.useOneValue(key);
			const [newValue, setNewValue] = newStorage.useOneValue(key);

			if (oldValue === undefined || newValue === undefined) {
				return [oldValue, setOldValue];
			}

			if (newValue === undefined || newValue === null) {
				migrate();
				return [undefined, setOldValue];
			}

			return [oldSceneFromNewScene(Scene.decode(newValue)), async (scene) => {
				await Promise.all([
					// setOldValue(scene),
					setNewValue(Scene.encode(newSceneFromOldScene(scene)).finish())
				])
			}]
		},
		deleteItem: async (key: string) => {
			const scene = await oldStorage.storage.getItem(key);
			for (const layer of scene.layers) {
				if (layer.type !== LayerType.ASSETS) continue;

				for (const asset of Array.from((layer as IAssetLayer).assets.values())) {
					await deleteAsset(asset)
				}
			}

			await oldStorage.deleteItem(key);
		}
	};
}

export function createNewScene(): IScene {
	const defaultLayer = createNewLayer(LayerType.ASSETS);
	defaultLayer.name = 'Layer 1';

	return {
		id: v4(),
		name: 'Untitled',
		version: 0,
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
