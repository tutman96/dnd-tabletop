import React from 'react';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';

import ZoomInOutlinedIcon from '@mui/icons-material/ZoomInOutlined';
import ZoomOutOutlinedIcon from '@mui/icons-material/ZoomOutOutlined';
import theme from '../../../theme';

const ZOOM_RATE = 1.5;

type Props = {zoom: number; onUpdate: (zoom: number) => void};
const ZoomToolbarItem: React.FunctionComponent<Props> = ({zoom, onUpdate}) => {
  let zoomDisplay: string;
  if (zoom < 1) {
    zoomDisplay = `1/${+(1 / zoom).toFixed(1)}x`;
  } else {
    zoomDisplay = `${+zoom.toFixed(1)}x`;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        paddingX: theme.spacing(1),
      }}
    >
      Zoom:
      <IconButton
        size="small"
        onClick={() => {
          let newZoom = Math.round((zoom / ZOOM_RATE) * 100) / 100;
          if (newZoom > 0.95 && newZoom < 1.05) newZoom = 1;
          onUpdate(newZoom);
        }}
      >
        <ZoomOutOutlinedIcon />
      </IconButton>
      <Box
        sx={{
          minWidth: theme.spacing(2),
          textAlign: 'center',
        }}
      >
        {zoomDisplay}
      </Box>
      <IconButton
        size="small"
        onClick={() => {
          let newZoom = Math.round(zoom * ZOOM_RATE * 100) / 100;
          if (newZoom > 0.95 && newZoom < 1.05) newZoom = 1;
          onUpdate(newZoom);
        }}
      >
        <ZoomInOutlinedIcon />
      </IconButton>
      {zoom !== 1 && (
        <Button
          size="small"
          onClick={() => {
            onUpdate(1);
          }}
        >
          Reset Zoom
        </Button>
      )}
    </Box>
  );
};
export default ZoomToolbarItem;
