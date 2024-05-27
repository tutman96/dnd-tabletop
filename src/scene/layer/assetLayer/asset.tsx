import React, {useEffect} from 'react';
import {Image} from 'react-konva';

import {useAssetElement} from '../../asset';
import TransformableAsset from '../../canvas/transformableAsset';
import * as Types from '../../../protos/scene';

type Props = {
  asset: Types.AssetLayer_Asset;
  onUpdate: (asset: Types.AssetLayer_Asset) => void;
  selected: boolean;
  onSelected: () => void;
  playAudio: boolean;
};
const Asset: React.FunctionComponent<Props> = ({
  asset,
  onUpdate,
  selected,
  onSelected,
  playAudio,
}) => {
  const el = useAssetElement(asset);

  useEffect(() => {
    if (asset.type === Types.AssetLayer_Asset_AssetType.VIDEO && el) {
      (el as HTMLVideoElement).muted = !playAudio;
      return () => {
        (el as HTMLVideoElement).muted = true;
      };
    }
    return () => {};
  }, [asset, playAudio, el]);

  const xOffset = asset.calibration
    ? asset.calibration.xOffset / asset.calibration.ppiX
    : 0;
  const yOffset = asset.calibration
    ? asset.calibration.yOffset / asset.calibration.ppiY
    : 0;

  return (
    <TransformableAsset
      isSelected={selected}
      onSelected={onSelected}
      rectTransform={asset.transform!}
      snapOffset={asset.snapToGrid ? {x: xOffset, y: yOffset} : undefined}
      onTransform={newRect => {
        onUpdate({
          ...asset,
          transform: newRect,
        });
      }}
    >
      {el && (
        <Image
          image={el}
          width={asset.transform!.width}
          height={asset.transform!.height}
        />
      )}
    </TransformableAsset>
  );
};

export default Asset;
