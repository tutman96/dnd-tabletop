import React from 'react';
import { Image } from 'react-konva';

import { IAsset, useAssetElement } from '../../asset';
import TransformableAsset from '../../canvas/transformableAsset';

type Props = {
	asset: IAsset;
	onUpdate: (asset: IAsset) => void;
	selected: boolean;
	onSelected: () => void;
};
const Asset: React.SFC<Props> = ({ asset, onUpdate, selected, onSelected }) => {
	const el = useAssetElement(asset);

	const xOffset = asset.calibration ? (asset.calibration.xOffset * (asset.transform.width / asset.size.width)) : 0;
	const yOffset = asset.calibration ? (asset.calibration.yOffset * (asset.transform.height / asset.size.height)) : 0;

	return (
		<TransformableAsset
			isSelected={selected}
			onSelected={onSelected}
			rectTransform={asset.transform}
			snapOffset={asset.snapToGrid ? { x: xOffset, y: yOffset } : undefined}
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