import { v4 } from "uuid";
import LRU from 'lru-cache';

import { IImageAsset } from "../layer/assetLayer/imageAsset";
import { useAssetFileDatabase } from "./storage";
import { AssetType } from ".";
import { useState, useEffect } from "react";

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

type CacheEntry = { file: File, image?: HTMLImageElement };
const imageCache = new LRU<string, CacheEntry | null>({
	max: 1024 * 1024 * 1024, // 1 MB
	length: (entry) => (entry ? entry.file.size : 0),
	maxAge: 60 * 60 * 1000 // 1 hour
})
export function useImageAsset(asset: IImageAsset) {
	const [entry, setEntry] = useState<CacheEntry | null | undefined>(imageCache.get(asset.id));

	useEffect(() => {
		if (entry === undefined) {
			fileStorage.getItem(asset.id).then((f) => {
				const entry = { file: f };
				
				imageCache.set(asset.id, entry)
				setEntry(entry);
			})
		}
		else if (entry && !entry.image) {
			var fr = new FileReader();
			const img = document.createElement('img') as HTMLImageElement;
			fr.onload = function () {
				if (fr.result) {
					img.src = fr.result as string;
					entry.image = img;
					
					imageCache.set(asset.id, entry);
					setEntry({ ...entry });
				}
			}
			fr.readAsDataURL(entry.file);
		}
	}, [entry, asset.id])

	return entry === null ? null : entry?.image;
}