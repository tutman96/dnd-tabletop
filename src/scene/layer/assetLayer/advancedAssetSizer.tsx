import React, { useState, useEffect } from 'react';
import { IAssetCalibration } from '../../asset';
import { InputGroup, Input, useTheme, IconButton, IconLock, IconUnlock } from 'sancho';
import { css } from "emotion";

const AdvancedAssetSizer: React.SFC<{ calibration: IAssetCalibration; onUpdate: (calibration: IAssetCalibration) => void; }> = ({ calibration, onUpdate }) => {
  const theme = useTheme();
  const formItemMargin = css`margin: 0 ${theme.spaces.sm};`;

  function updateCalibrationValue(keys: Array<keyof IAssetCalibration>, e: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(e.target.value);
    if (!isNaN(value)) {
      const newCal = { ...calibration! };
      for (const key of keys) {
        newCal[key] = value;
      }
      onUpdate(newCal)
    }
  }

  const [ppiLocked, setPPILocked] = useState(calibration.ppiX === calibration.ppiY);
  useEffect(() => {
    if (ppiLocked && calibration.ppiX !== calibration.ppiY) {
      onUpdate({
        ...calibration,
        ppiY: calibration.ppiX
      })
    }
  }, [calibration, onUpdate, ppiLocked])

  return (
    <>
      <InputGroup label="Pixels per Inch">
        <div
          className={css`
            display: flex; 
            align-items: center;
          `}
        >
          <Input
            type="number"
            min={1}
            placeholder="Horizontal PPI"
            value={calibration.ppiX}
            onChange={(e) => updateCalibrationValue((ppiLocked ? ['ppiX', 'ppiY'] : ['ppiX']), e)}
          />
          <div className={formItemMargin}>
            <IconButton
              variant="ghost"
              label={ppiLocked ? 'Unlock PPI' : 'Lock PPI'}
              icon={ppiLocked ? <IconLock /> : <IconUnlock />}
              onClick={() => setPPILocked(!ppiLocked)}
            />
          </div>
          <Input
            type="number"
            min={1}
            placeholder="Vertical PPI"
            value={ppiLocked ? calibration.ppiX : calibration.ppiY}
            disabled={ppiLocked}
            onChange={(e) => updateCalibrationValue(['ppiY'], e)}
          />
        </div>
      </InputGroup>
      <InputGroup label="Offset">
        <div
          className={css`
            display: flex; 
            align-items: center;
          `}
        >
          <Input
            type="number"
            placeholder="Horizontal Offset"
            value={calibration.xOffset}
            onChange={(e) => updateCalibrationValue(['xOffset'], e)}
          />
          <div className={formItemMargin}>x</div>
          <Input
            type="number"
            placeholder="Vertical Offset"
            value={calibration.yOffset}
            onChange={(e) => updateCalibrationValue(['yOffset'], e)}
          />
        </div>
      </InputGroup>
    </>
  );
};

export default AdvancedAssetSizer;