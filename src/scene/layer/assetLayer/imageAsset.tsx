import React, { useEffect, useState } from 'react';
import { Image } from 'react-konva';

import TransformableAsset from '../../canvas/transformableAsset';
import { useImageAssetFile } from '../../asset/image';
import { IAssetComponentProps } from '.';
import { IAsset } from '../../asset';

export interface IImageAsset extends IAsset {

}

interface Props extends IAssetComponentProps<IImageAsset> { };
const ImageAsset: React.SFC<Props> = ({ asset, onUpdate, selected, onSelected }) => {
	const [imageEl, setImageEl] = useState<HTMLImageElement>();

	const [file] = useImageAssetFile(asset);

	useEffect(() => {
		if (file) {
			var fr = new FileReader();
			const img = document.createElement('img') as HTMLImageElement;
			fr.onload = function () {
				if (fr.result) {
					img.src = fr.result as string;
					setImageEl(img);
				}
			}
			fr.readAsDataURL(file);
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
				{imageEl && <Image
					image={imageEl}
					width={asset.transform.width}
					height={asset.transform.height}
				/>}
			</TransformableAsset>
	);
}

export default ImageAsset;