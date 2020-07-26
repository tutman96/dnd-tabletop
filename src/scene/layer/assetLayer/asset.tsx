import React from 'react';
import { Image } from 'react-konva';

import { IAsset, useAssetElement } from '../../asset';
import TransformableAsset from '../../canvas/transformableAsset';
import { IAssetComponentProps } from '.';

interface Props extends IAssetComponentProps<IAsset> { };
const Asset: React.SFC<Props> = ({ asset, onUpdate, selected, onSelected }) => {
	const el = useAssetElement(asset);

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
			{el && <Image
				image={el}
				width={asset.transform.width}
				height={asset.transform.height}
			/>}
		</TransformableAsset>
	);
}

export default Asset;