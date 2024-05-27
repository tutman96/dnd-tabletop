import React, {useState, useEffect} from 'react';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';

import theme from '../../../theme';
import InputWithUnit from '../../../partials/inputWithUnit';
import InputGroup from '../../../partials/inputGroup';
import * as Types from '../../../protos/scene';

const AdvancedAssetSizer: React.FunctionComponent<{
  calibration: Types.AssetLayer_Asset_AssetCalibration;
  onUpdate: (calibration: Types.AssetLayer_Asset_AssetCalibration) => void;
}> = ({calibration, onUpdate}) => {
  function updateCalibrationValue(
    keys: Array<keyof Types.AssetLayer_Asset_AssetCalibration>,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const value = Number(e.target.value);
    if (!isNaN(value)) {
      const newCal = {...calibration!};
      for (const key of keys) {
        newCal[key] = value;
      }
      onUpdate(newCal);
    }
  }

  const [ppiLocked, setPPILocked] = useState(
    calibration.ppiX === calibration.ppiY
  );
  useEffect(() => {
    if (ppiLocked && calibration.ppiX !== calibration.ppiY) {
      setPPILocked(false);
    }
  }, [calibration, onUpdate, ppiLocked]);

  return (
    <Box sx={{marginTop: theme.spacing(1)}}>
      <InputGroup header="Pixels per Inch">
        <InputWithUnit
          type="number"
          inputProps={{min: 1}}
          placeholder="Horizontal PPI"
          unit="ppi"
          fullWidth
          value={calibration.ppiX}
          onChange={e =>
            updateCalibrationValue(ppiLocked ? ['ppiX', 'ppiY'] : ['ppiX'], e)
          }
        />
        <Tooltip title={ppiLocked ? 'Unlock PPI' : 'Lock PPI'}>
          <IconButton
            sx={{marginX: theme.spacing(1)}}
            onClick={() => {
              if (calibration.ppiX !== calibration.ppiY) {
                onUpdate({
                  ...calibration,
                  ppiY: calibration.ppiX,
                });
              }
              setPPILocked(!ppiLocked);
            }}
          >
            {ppiLocked ? <LockOutlinedIcon /> : <LockOpenOutlinedIcon />}
          </IconButton>
        </Tooltip>
        <InputWithUnit
          type="number"
          inputProps={{min: 1}}
          placeholder="Vertical PPI"
          unit="ppi"
          fullWidth
          value={ppiLocked ? calibration.ppiX : calibration.ppiY}
          disabled={ppiLocked}
          onChange={e => updateCalibrationValue(['ppiY'], e)}
        />
      </InputGroup>
      <InputGroup header="Offset">
        <InputWithUnit
          type="number"
          placeholder="Horizontal Offset"
          unit="px"
          fullWidth
          value={calibration.xOffset}
          onChange={e => updateCalibrationValue(['xOffset'], e)}
        />
        <Box sx={{margin: theme.spacing(1)}}>x</Box>
        <InputWithUnit
          type="number"
          placeholder="Vertical Offset"
          unit="px"
          fullWidth
          value={calibration.yOffset}
          onChange={e => updateCalibrationValue(['yOffset'], e)}
        />
      </InputGroup>
    </Box>
  );
};

export default AdvancedAssetSizer;
