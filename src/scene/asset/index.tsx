import { IAsset, AssetType } from "..";


import { createImageAsset, deleteImageAsset } from "./image";
import { createVideoAsset, deleteVideoAsset } from "./video";

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

				if (file.type.indexOf('image') === 0) {
					assets.push(await createImageAsset(file));
				}
				else if (file.type.indexOf('video') === 0) {
					assets.push(await createVideoAsset(file));
				}
			}
			res(assets);
		}
	});
}

export async function deleteAsset(asset: IAsset) {
	if (asset.type === AssetType.IMAGE) {
		await deleteImageAsset(asset);
	}
	else if (asset.type === AssetType.VIDEO) {
		await deleteVideoAsset(asset);
	}
}