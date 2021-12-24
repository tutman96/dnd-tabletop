import React from 'react';
import { Layer, Rect } from 'react-konva';
import { css } from 'emotion';
import Konva from 'konva';

import { IAssetCalibration, IAsset } from '../../asset';
import DraggableStage from '../../canvas/draggableStage';
import Asset from './asset';
import { useExtendedTheme } from '../../../theme';
import { useTablePPI } from '../../../settings';
import TransformableAsset from '../../canvas/transformableAsset';

const RESIZE_SQUARES = 3;

const VisualAssetSizer: React.SFC<{ asset: IAsset; onUpdate: (calibration: IAssetCalibration) => void; }> = ({ asset, onUpdate }) => {
  const theme = useExtendedTheme();
  const tablePPI = useTablePPI();

  if (!tablePPI || !asset.calibration) {
    return null;
  }

  const innerRectangles = Array<Konva.RectConfig>();
  for (let i = 1; i < RESIZE_SQUARES; i += 2) {
    innerRectangles.push({
      width: asset.calibration.ppiX * RESIZE_SQUARES,
      height: asset.calibration.ppiY * 1,
      x: 0,
      y: asset.calibration.ppiY * i
    })
    innerRectangles.push({
      width: asset.calibration.ppiX * 1,
      height: asset.calibration.ppiY * RESIZE_SQUARES,
      x: asset.calibration.ppiX * i,
      y: 0
    })
  }

  return (
    <DraggableStage
      width={theme.visualAssetSizerSize}
      height={theme.visualAssetSizerSize}
      className={css`
        margin-left: -${theme.spaces.lg};
      `}
      initialZoom={(theme.visualAssetSizerSize / asset.size.width)}
    >
      <Layer>
        <Asset
          asset={{
            ...asset,
            transform: {
              ...asset.size,
              rotation: 0,
              x: 0,
              y: 0
            }
          }}
          onSelected={() => { }}
          selected={false}
          onUpdate={() => { }}
          playAudio={false}
        />
      </Layer>
      <Layer>
        <TransformableAsset
          rectTransform={{
            width: asset.calibration.ppiX * RESIZE_SQUARES,
            height: asset.calibration.ppiY * RESIZE_SQUARES,
            x: asset.calibration.xOffset,
            y: asset.calibration.yOffset,
            rotation: 0
          }}
          rotateEnabled={false}
          strokeEnabled={false}
          isSelected={true}
          onSelected={() => { }}
          onTransform={(transform) => {
            onUpdate({
              ppiX: Math.round(transform.width! / RESIZE_SQUARES * 100) / 100,
              ppiY: Math.round(transform.height! / RESIZE_SQUARES * 100) / 100,
              xOffset: Math.round(transform.x! * 100) / 100,
              yOffset: Math.round(transform.y! * 100) / 100
            })
          }}
        >
          {/* Outside rect */}
          <Rect
            x={0}
            y={0}
            width={asset.calibration.ppiX * RESIZE_SQUARES}
            height={asset.calibration.ppiY * RESIZE_SQUARES}
            strokeWidth={1}
            stroke={theme.colors.palette.blue.base}
            strokeScaleEnabled={false}
          />
          {innerRectangles.map((rect, i) => (
            <Rect
              key={i}
              {...rect}
              strokeWidth={1}
              stroke={theme.colors.palette.blue.base}
              strokeScaleEnabled={false}
            />
          ))}
        </TransformableAsset>
      </Layer>
    </DraggableStage>
  );
};

export default VisualAssetSizer;