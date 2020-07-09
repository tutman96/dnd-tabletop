import { v4 } from "uuid";

import { IVideoAsset } from "../layer/assetLayer/videoAsset";
import { useAssetFileDatabase } from "./storage";
import { AssetType } from ".";

function getVideoSize(file: File) {
	return new Promise<{ width: number, height: number }>((res) => {
		const video = document.createElement('video');
		video.src = URL.createObjectURL(file);
		video.addEventListener('loadedmetadata', () => {
			res({
				width: video.videoWidth,
				height: video.videoHeight
			})
		});
	})
}

const { storage: fileStorage } = useAssetFileDatabase();

export async function createVideoAsset(file: File) {
	const { width, height } = await getVideoSize(file);
	const asset = {
		id: v4(),
		type: AssetType.VIDEO,
		transform: {
			x: 0, y: 0,
			width, height,
			rotation: 0
		}
	} as IVideoAsset;
	await fileStorage.setItem(asset.id, file);
	return asset;
}

export async function deleteVideoAsset(asset: IVideoAsset) {
	await fileStorage.removeItem(asset.id);
}

export function useVideoAssetFile(asset: IVideoAsset) {
	return useAssetFileDatabase().useOneValue(asset.id);
}