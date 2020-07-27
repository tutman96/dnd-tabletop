import React, { useState, useEffect } from 'react';
import { IAsset, IAssetCalibration } from '../../asset';
import { IconSliders, Dialog, useTheme, Button } from 'sancho';
import { css } from "emotion";

import ToolbarItem from '../toolbarItem';
import AdvancedAssetSizer from './advancedAssetSizer';
import { AssetTransform } from '../../canvas/transformableAsset';

export function calculateCalibratedTransform(asset: IAsset, screenPPI: number): AssetTransform {
  if (!asset.calibration) {
    return asset.transform;
  }

  console.log(asset);
  return {
    ...asset.transform,
    width: (asset.size.width / asset.calibration.ppiX) * screenPPI,
    height: (asset.size.height / asset.calibration.ppiY) * screenPPI
  }
}

type Props = {
  asset?: IAsset,
  onUpdate: (asset: IAsset) => void
};

const AssetSizer: React.SFC<Props> = ({ asset, onUpdate }) => {
  const theme = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [calibration, setCalibration] = useState<IAssetCalibration>();

  useEffect(() => {
    if (asset) {
      setCalibration(asset.calibration || {
        ppiX: 150,
        ppiY: 150,
        xOffset: 0,
        yOffset: 0
      });
    }
  }, [asset])

  return (
    <>
      <ToolbarItem
        label="Calibrate Size"
        icon={<IconSliders />}
        onClick={() => setShowModal(true)}
        disabled={!asset}
      />
      {calibration && asset &&
        <Dialog
          isOpen={showModal}
          onRequestClose={() => setShowModal(false)}
          title="Asset Calibration"
        >
          <div className={css`padding: ${theme.spaces.lg};`}>
            <AdvancedAssetSizer calibration={calibration} onUpdate={setCalibration} />

            <div
              className={css`
                display: flex;
                margin-top: ${theme.spaces.lg};
                justify-content: flex-end;
              `}
            >
              <Button variant="ghost" intent="primary" onClick={() => onUpdate({ ...asset, calibration })}>Save</Button>
            </div>
          </div>
        </Dialog>
      }
    </>
  )
}
export default AssetSizer;