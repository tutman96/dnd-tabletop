import LRU from 'lru-cache';
import { useState, useEffect } from 'react';

import { getImageSize, getVideoSize } from "./assetSize";
import { AssetTransform } from "../canvas/transformableAsset";
import { assetFileDatabase } from './storage';
import { v4 } from 'uuid';

const { storage: fileStorage } = assetFileDatabase();

export enum AssetType {
	IMAGE,
	VIDEO
}

export interface IAssetCalibration {
	xOffset: number;
	yOffset: number;
	ppiX: number;
	ppiY: number;
}

export interface IAsset {
	id: string;
	size: { width: number, height: number };
	transform: AssetTransform;
	overrideCalibration?: boolean;
	calibration?: IAssetCalibration
	type: AssetType;
	snapToGrid?: boolean
}

export function getNewAssets() {
	const fileDialogInput = document.createElement('input');
	fileDialogInput.type = "file";
	fileDialogInput.multiple = true;
	fileDialogInput.accept = 'image/*,video/*';

	fileDialogInput.click();
	return new Promise<Array<IAsset>>((res) => {
		fileDialogInput.onchange = async (e) => {
			const files = (e!.target as HTMLInputElement).files;
			if (!files) {
				return;
			}

			const assets = new Array<IAsset>();
			for (let i = 0; i < files.length; i++) {
				const file = files.item(i);
				if (!file) continue;

				assets.push(await createAsset(file));
			}
			res(assets);
		}
	});
}

export async function createAsset(file: File) {
	const asset = {
		id: v4(),
		type: AssetType.IMAGE,
		transform: {
			x: 0, y: 0,
			width: 0, height: 0,
			rotation: 0
		}
	} as IAsset;

	let res: { width: number, height: number };
	if (file.type.indexOf('image') === 0) {
		res = await getImageSize(file);
		asset.type = AssetType.IMAGE;
	}
	else if (file.type.indexOf('video') === 0) {
		res = await getVideoSize(file)
		asset.type = AssetType.VIDEO;
	}
	else {
		throw new Error('Unknown file type');
	}

	asset.size = {
		width: res.width,
		height: res.height
	}
	asset.transform.width = res.width;
	asset.transform.height = res.height;

	await fileStorage.setItem(asset.id, file);
	return asset;
}

export async function deleteAsset(asset: IAsset) {
	await fileStorage.removeItem(asset.id);
}


type CacheEntry = { file: File, element?: HTMLImageElement | HTMLVideoElement };
const assetCache = new LRU<string, CacheEntry | null>({
	max: 1024 * 1024 * 500, // 500 MB
	length: (entry) => (entry ? entry.file.size : 0),
	maxAge: 60 * 60 * 1000 // 1 hour
})

async function getImageElement(file: File) {
	return new Promise<HTMLImageElement>((res) => {
		var fr = new FileReader();
		const img = document.createElement('img') as HTMLImageElement;
		fr.onload = function () {
			if (fr.result) {
				img.src = fr.result as string;
				res(img);
			}
		}
		fr.readAsDataURL(file);
	})
}

async function getVideoElement(file: File) {
	const video = document.createElement('video');
	video.src = URL.createObjectURL(file);
	video.loop = true;
	video.muted = true;
	video.autoplay = true;
	video.play();
	return video;
}

export function useAssetElement(asset: IAsset) {
	const [entry, setEntry] = useState<CacheEntry | null | undefined>(assetCache.get(asset.id));

	useEffect(() => {
		if (entry === undefined) {
			fileStorage.getItem(asset.id)
				.then(async (file) => {
					const element = await (asset.type === AssetType.IMAGE ? getImageElement(file) : getVideoElement(file));
					const entry = { file, element };
					assetCache.set(asset.id, entry)
					setEntry(entry);
				})
		}
	}, [entry, asset.type, asset.id])

	return entry === null ? null : entry?.element;
}