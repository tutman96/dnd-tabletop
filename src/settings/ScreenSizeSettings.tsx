import React from "react";

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import theme from "../theme";
import InputWithUnit from "../partials/inputWithUnit";
import InputGroup from "../partials/inputGroup";
import { useTableResolution, useTableSize } from './index';

const DEFAULT_TABLE_RESOLUTIONS = [
  {
    name: '1080p',
    width: 1920, height: 1080
  },
  {
    name: '4K',
    width: 3840, height: 2160
  }
]

const TableResolutionSettings: React.FunctionComponent = () => {
  const [tableResolution, setTableResolution] = useTableResolution();

  if (tableResolution === undefined) {
    return null;
  }

  return (
    <Box>
      <InputGroup header="Resolution">
        <InputWithUnit
          type="number"
          inputProps={{ min: 1 }}
          unit="px"
          fullWidth
          value={tableResolution.width}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (!isNaN(value)) {
              setTableResolution({ ...tableResolution, width: value });
            }
          }} />
        <Box sx={{ margin: theme.spacing(1) }}>x</Box>
        <InputWithUnit
          type="number"
          inputProps={{ min: 1 }}
          unit="px"
          fullWidth
          value={tableResolution.height}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (!isNaN(value)) {
              setTableResolution({ ...tableResolution, height: value });
            }
          }} />
      </InputGroup>

      <Box sx={{
        display: 'flex',
        alignItems: 'baseline',
        flexDirection: 'row'
      }}>
        <Typography variant='caption' sx={{
          marginRight: theme.spacing(1)
        }}>Presets:</Typography>
        <Box
          sx={{
            // paddingY: theme.spacing(2),
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap'
          }}
        >
          {DEFAULT_TABLE_RESOLUTIONS.map((resolution) => (
            <Button
              key={resolution.name}
              size="small"
              variant="outlined"
              sx={{
                margin: `0 ${theme.spacing(1)} ${theme.spacing(1)} 0`,
              }}
              color={
                tableResolution.width === resolution.width &&
                  tableResolution.height === resolution.height ?
                  'primary' :
                  'secondary'
              }
              onClick={() => {
                setTableResolution(resolution);
              }}
            >
              {resolution.name}
            </Button>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

const ScreenSizeSettings: React.FunctionComponent = () => {
  const [tableSize, setTableSize] = useTableSize();

  if (tableSize === undefined) {
    return null;
  }

  return (
    <>
      <TableResolutionSettings />
      <InputGroup header="Screen Size">
        <InputWithUnit
          type="number"
          inputProps={{ min: 1, max: 200, step: 0.1 }}
          unit="in"
          fullWidth
          value={tableSize}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (!isNaN(value) && value <= 200 && value > 1) {
              setTableSize(value);
            }
          }} />
      </InputGroup>
    </>
  );
};

export default ScreenSizeSettings