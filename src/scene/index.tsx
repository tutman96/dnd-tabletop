import { v4 } from "uuid";

import globalStorage from "../storage";
import { createNewLayer, unflattenLayer } from "./layer";
import { deleteAsset, fileStorage } from "./asset";
import * as Types from "../protos/scene";
import { oldStorage } from './oldStorage';
import { useCallback, useEffect, useState } from "react";

export const newStorage = globalStorage<Uint8Array>('scene_2')
export function sceneDatabase() {
	return {
		...newStorage,
		createItem: async (key: string, item: Types.Scene) => {
			await newStorage.createItem(key, Types.Scene.encode(item).finish());
		},
		useAllValues: () => {
			const oldValues = oldStorage.useAllValues();
			const newValues = newStorage.useAllValues();

			if (oldValues === undefined || newValues === undefined) {
				return undefined;
			}

			return new Map(
				Array.from(newValues.entries())
					.map(([sceneId, buf]) => [sceneId, Types.Scene.decode(buf)])
			)
		},
		useOneValue: (key: string): [Types.Scene | null | undefined, (newData: Types.Scene) => void] => {
			const [newValue, setNewValue] = newStorage.useOneValue(key);
			const [localValue, setLocalValue] = useState<Types.Scene>()

			useEffect(() => {
				setLocalValue(undefined);
			}, [key])

			useEffect(() => {
				if (!newValue) return;
				const decodedNewValue = Types.Scene.decode(newValue);
				
				// Initial load
				if (!localValue) {
					setLocalValue(decodedNewValue);
					return;
				}

				// Storage updates
				if (decodedNewValue && (
					decodedNewValue.id !== localValue.id ||
					decodedNewValue.version > localValue.version
				)) {
					setLocalValue(decodedNewValue);
					return;
				}

				// Local updates
				if (decodedNewValue.id === localValue.id && decodedNewValue.version < localValue.version) {
					setNewValue(Types.Scene.encode(localValue).finish());
					return;
				}
			}, [localValue, newValue, setNewValue])

			const updateScene = useCallback((scene: Types.Scene) => {
				scene.version++;
				console.log('Updating scene ' + scene.name + ' to v' + scene.version, scene);
				setLocalValue({ ...scene }); // TODO: this deref should be unnecessary
			}, [])

			if (newValue === undefined) {
				return [undefined, updateScene];
			}

			if (newValue === null) {
				return [null, updateScene];
			}

			return [localValue, updateScene]
		},
		deleteItem: async (key: string) => {
			const scene = Types.Scene.decode(await newStorage.storage.getItem(key));
			for (const layer of scene.layers) {
				if (!layer.assetLayer) continue;

				for (const asset of Object.values((layer.assetLayer as Types.AssetLayer).assets)) {
					await deleteAsset(asset)
				}
			}

			await oldStorage.deleteItem(key);
		}
	};
}

export function createNewScene(): Types.Scene {
	const defaultLayer = createNewLayer(Types.Layer_LayerType.ASSETS);
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
			unflattenLayer(defaultLayer)
		]
	};
}


window['garbageCollect'] = async function () {
	const sceneIds = await newStorage.storage.keys();

	const foundAssets = new Set<string>();
	for (const sceneId of sceneIds) {
		const encodedScene = await newStorage.storage.getItem(sceneId);
		const scene = Types.Scene.decode(encodedScene);

		for (const layer of scene.layers) {
			if (!layer.assetLayer) continue;
			for (const asset of Object.values(layer.assetLayer.assets)) {
				foundAssets.add(asset.id);
			}
		}
	}

	const allAssets = new Set(await fileStorage.keys());
	console.warn('Removing ' + (allAssets.size - foundAssets.size) + ' assets');
	for (const asset of Array.from(allAssets.keys())) {
		if (foundAssets.has(asset)) continue;

		await fileStorage.removeItem(asset)
	}
}