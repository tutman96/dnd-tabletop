import { v4 } from "uuid";
import React from "react";
import { IconButton, IconFilePlus } from "sancho";

import { IImageAsset } from "./canvas/imageAsset";
import { IVideoAsset } from "./canvas/videoAsset";
import { IScene, IAsset, AssetType, useSceneFileDatabase } from ".";

const { storage: sceneStorage } = useSceneFileDatabase();

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

function getImageAsset() {
	const fileDialogInput = document.createElement('input');
	fileDialogInput.type = "file";
	fileDialogInput.multiple = false;
	fileDialogInput.accept = 'image/*,video/*';

	fileDialogInput.click();
	return new Promise<IAsset>((res) => {
		fileDialogInput.onchange = async (e) => {
			const files = (e!.target as HTMLInputElement).files;
			if (!files) {
				return;
			}

			for (let i = 0; i < files.length; i++) {
				const file = files.item(i);
				if (!file) continue;

				if (file.type.indexOf('image') === 0) {
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
					await sceneStorage.setItem(asset.id, file);
					res(asset);
				}
				else if (file.type.indexOf('video') === 0) {
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
					await sceneStorage.setItem(asset.id, file);
					res(asset);
				}
			}
		}
	});
}

type Props = { scene: IScene, onUpdate: (scene: IScene) => void };
const AddAssetButton: React.SFC<Props> = ({ scene, onUpdate }) => {
	return (
		<IconButton
			icon={<IconFilePlus />}
			variant="ghost"
			label="Add Asset"
			onClick={async () => {
				const asset = await getImageAsset();
				scene.assets.set(asset.id, asset);
				onUpdate({
					...scene
				})
			}}
		/>
	);
}
export default AddAssetButton;