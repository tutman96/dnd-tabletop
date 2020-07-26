import { v4 } from "uuid";

import useGlobalStorage from "../storage";
import { ILayer, LayerType, createNewLayer } from "./layer";
import { Vector2d } from "konva/types/types";

export interface IScene {
	id: string;
	name: string;
	table: {
		offset: Vector2d,
		scale: number,
		displayGrid: boolean
	},
	layers: Array<ILayer>;
}

const storage = useGlobalStorage<IScene>('scene');
export function useSceneDatabase() {
	return storage;
}

export function createNewScene(): IScene {
	const defaultLayer = createNewLayer(LayerType.ASSETS);
	defaultLayer.name = 'Layer 1';

	return {
		id: v4(),
		name: 'Untitled',
		table: {
			offset: { x: 0, y: 0 },
			scale: 1,
			displayGrid: true
		},
		layers: [
			defaultLayer
		]
	};
}