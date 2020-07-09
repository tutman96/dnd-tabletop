import { v4 } from "uuid";

import { AssetType } from "..";
import { IImageAsset } from "../canvas/imageAsset";
import { useAssetFileDatabase } from "./storage";

function getImageSize(file: File) {
	return new Promise<{ width: number, height: number }>((res) => {
		const img = new Image();
		img.src = URL.createObjectURL(file);
		img.onload = () => {
			res({
				width: img.width,
				height: img.height
			})
		}
	})
}

const { storage: fileStorage } = useAssetFileDatabase();

export async function createImageAsset(file: File) {
	const { width, height } = await getImageSize(file);
	const asset = {
		id: v4(),
		type: AssetType.IMAGE,
		transform: {
			x: 0, y: 0,
			width, height,
			rotation: 0
		}
	} as IImageAsset;
	await fileStorage.setItem(asset.id, file);
	return asset;
}

export async function deleteImageAsset(asset: IImageAsset) {
	await fileStorage.removeItem(asset.id);
}

export function useImageAssetFile(asset: IImageAsset) {
	return useAssetFileDatabase().useOneValue(asset.id);
}