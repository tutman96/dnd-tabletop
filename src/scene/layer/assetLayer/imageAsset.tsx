import React from 'react';
import { Image } from 'react-konva';

import TransformableAsset from '../../canvas/transformableAsset';
import { useImageAsset } from '../../asset/image';
import { IAssetComponentProps } from '.';
import { IAsset } from '../../asset';

export interface IImageAsset extends IAsset {

}

interface Props extends IAssetComponentProps<IImageAsset> { };
const ImageAsset: React.SFC<Props> = ({ asset, onUpdate, selected, onSelected }) => {
	const imageEl = useImageAsset(asset);

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
			{imageEl && <Image
				image={imageEl}
				width={asset.transform.width}
				height={asset.transform.height}
			/>}
		</TransformableAsset>
	);
}

export default ImageAsset;