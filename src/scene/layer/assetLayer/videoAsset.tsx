import React, { useEffect, useState } from 'react';
import { Image } from 'react-konva';

import { IAsset } from '../../asset';
import TransformableAsset from '../../canvas/transformableAsset';
import { useVideoAssetFile } from '../../asset/video';
import { IAssetComponentProps } from '.';

export interface IVideoAsset extends IAsset {
}

interface Props extends IAssetComponentProps<IVideoAsset> { };
const VideoAsset: React.SFC<Props> = ({ asset, onUpdate, selected, onSelected }) => {
	const [videoEl, setVideoEl] = useState<HTMLVideoElement>();
	const [file] = useVideoAssetFile(asset);

	useEffect(() => {
		if (file) {
			const video = document.createElement('video');
			video.src = URL.createObjectURL(file);
			video.muted = true;
			video.autoplay = true;
			video.play();
			setVideoEl(video);
		}
	}, [file])

	return (
		<TransformableAsset
			isSelected={selected}
			onSelected={onSelected}
			rectTransform={asset.transform}
			onTransform={(newRect) => {
				onUpdate({
					...asset,
					transform: newRect
				})
			}}>
			{videoEl && <Image
				image={videoEl}
				width={asset.transform.width}
				height={asset.transform.height}
			/>}
		</TransformableAsset>
	);
}

export default VideoAsset;