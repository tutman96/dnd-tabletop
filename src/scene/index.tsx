import { v4 } from "uuid";

import useGlobalStorage from "../storage";
import { ILayer, LayerType } from "./layer";
import { IAssetLayer } from "./layer/assetLayer";

export interface IScene {
	id: string;
	name: string;
	layers: Array<ILayer>;
}

const storage = useGlobalStorage<IScene>('scene');
export function useSceneDatabase() {
	return storage;
}

export function createNewScene(): IScene {
	return {
		id: v4(),
		name: 'Untitled',
		layers: [
			{
				id: v4(),
				type: LayerType.ASSETS,
				name: 'Layer 1',
				assets: new Map()
			} as IAssetLayer
		]
	};
}