import React, { useEffect, useState } from 'react';
import { Image, Layer } from 'react-konva';

import { IAsset, IAssetComponentProps } from "..";
import TransformableAsset from './transformableAsset';

export interface IImageAsset extends IAsset {
	file: File
}

interface Props extends IAssetComponentProps<IImageAsset> { };

const ImageAsset: React.SFC<Props> = ({ asset, onUpdate, selected, onSelected }) => {
	const [imageEl, setImageEl] = useState<HTMLImageElement>();

	useEffect(() => {
		var fr = new FileReader();
		const img = document.createElement('img') as HTMLImageElement;
		fr.onload = function () {
			if (fr.result) {
				img.src = fr.result as string;
				setImageEl(img);
			}
		}
		fr.readAsDataURL(asset.file);
	}, [asset.file])

	return (
		<Layer>
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
		</Layer>
	);
}

export default ImageAsset;