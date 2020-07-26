import React from 'react';
import { Image } from 'react-konva';

import { IAsset } from '../../asset';
import TransformableAsset from '../../canvas/transformableAsset';
import { useVideoAsset } from '../../asset/video';
import { IAssetComponentProps } from '.';

export interface IVideoAsset extends IAsset {
}

interface Props extends IAssetComponentProps<IVideoAsset> { };
const VideoAsset: React.SFC<Props> = ({ asset, onUpdate, selected, onSelected }) => {
	const videoEl = useVideoAsset(asset);

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