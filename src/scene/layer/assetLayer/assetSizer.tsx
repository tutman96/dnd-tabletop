import React, { useState, useEffect } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import AspectRatioOutlinedIcon from '@mui/icons-material/AspectRatioOutlined';

import ToolbarItem from '../toolbarItem';
import AdvancedAssetSizer from './advancedAssetSizer';
import VisualAssetSizer from './visualAssetSizer';
import { VISUAL_ASSET_SIZER_SIZE } from '../../../theme';
import * as Types from '../../../protos/scene';

export function calculateCalibratedTransform(asset: Types.AssetLayer_Asset): Types.AssetLayer_Asset_AssetTransform {
  if (!asset.calibration) {
    return asset.transform!;
  }

  return {
    ...asset.transform!,
    width: (asset.size!.width / asset.calibration.ppiX),
    height: (asset.size!.height / asset.calibration.ppiY)
  }
}

type Props = {
  asset?: Types.AssetLayer_Asset,
  onUpdate: (asset: Types.AssetLayer_Asset) => void
};

const AssetSizer: React.FunctionComponent<Props> = ({ asset, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [calibration, setCalibration] = useState<Types.AssetLayer_Asset_AssetCalibration>();

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
        icon={<AspectRatioOutlinedIcon />}
        onClick={() => setShowModal(true)}
        disabled={!asset}
      />
      {calibration && asset &&
        <Dialog
          open={showModal}
          onClose={() => setShowModal(false)}
          maxWidth={false}
        >
          <DialogTitle>Asset Calibration</DialogTitle>
          <DialogContent sx={{ width: VISUAL_ASSET_SIZER_SIZE }}>
            <Typography>Drag the corners of the selection box to align with the existing grid on your map. Then drag the box to match the size of the grid squares.</Typography>
            <br />
            <VisualAssetSizer asset={{ ...asset, calibration }} onUpdate={setCalibration} />
            <AdvancedAssetSizer calibration={calibration} onUpdate={setCalibration} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              onUpdate({ ...asset, calibration })
              setShowModal(false);
            }}>Save</Button>
          </DialogActions>
        </Dialog>
      }
    </>
  )
}
export default AssetSizer;