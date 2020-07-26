import { v4 } from "uuid";
import LRU from 'lru-cache';
import { useState, useEffect } from "react";

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


type CacheEntry = { file: File, video: HTMLVideoElement };
const imageCache = new LRU<string, CacheEntry | null>({
	max: 1024 * 1024 * 500, // 500 MB
	length: (entry) => (entry ? entry.file.size : 0),
	maxAge: 60 * 60 * 1000 // 1 hour
})
export function useVideoAsset(asset: IVideoAsset) {
	const [entry, setEntry] = useState<CacheEntry | null | undefined>(imageCache.get(asset.id));

	useEffect(() => {
		if (entry === undefined) {
			fileStorage.getItem(asset.id).then((file) => {
				const video = document.createElement('video');
				video.src = URL.createObjectURL(file);
				video.muted = true;
				video.autoplay = true;
				video.play();

				const entry = { file, video };
				imageCache.set(asset.id, entry)
				setEntry(entry);
			})
		}
	}, [entry, asset.id])

	return entry === null ? null : entry?.video;
}