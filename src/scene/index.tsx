import { v4 } from "uuid";

import useGlobalStorage from "../storage";
import { AssetTransform } from "./canvas/transformableAsset";
import ImageAsset from "./canvas/imageAsset";
import VideoAsset from "./canvas/videoAsset";

export enum AssetType {
	IMAGE,
	VIDEO
}

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

export interface IAsset {
	id: string;
	transform: AssetTransform;
	type: AssetType;
}

export interface IScene {
	id: string;
	name: string;
	assets: Map<string, IAsset>;
}

const storage = useGlobalStorage<IScene>('scene');
export function useSceneDatabase() {
	return storage;
}

const fileStorage = useGlobalStorage<File>('scene_file');
export function useSceneFileDatabase() {
	return fileStorage;
}

export function createNewScene(): IScene {
	return {
		id: v4(),
		name: 'Untitled',
		assets: new Map()
	};
}