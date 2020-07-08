import React, { useRef, useEffect, useState } from 'react';
import { Image, Layer } from 'react-konva';
import Konva from 'konva';

import { IAsset, IAssetComponentProps, useSceneFileDatabase } from "..";
import TransformableAsset from './transformableAsset';

export interface IVideoAsset extends IAsset {
}

interface Props extends IAssetComponentProps<IVideoAsset> { };
const VideoAsset: React.SFC<Props> = ({ asset, onUpdate, selected, onSelected }) => {
	const [videoEl, setVideoEl] = useState<HTMLVideoElement>();
	const layerRef = useRef<Konva.Layer>();

	const [file] = useSceneFileDatabase().useOneValue(asset.id);

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

	useEffect(() => {
		if (!layerRef.current) return;

		const anim = new Konva.Animation(() => { }, layerRef.current);
		anim.start();
		return () => { anim.stop() }
	}, [layerRef])

	return (
		<Layer
			ref={layerRef as any}
		>
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
		</Layer>
	);
}

export default VideoAsset;