import React, { useState, useEffect } from 'react';
import Konva from 'konva';

import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Box from '@mui/material/Box';

import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import KeyboardArrowLeftOutlinedIcon from '@mui/icons-material/KeyboardArrowLeftOutlined';
import KeyboardArrowRightOutlinedIcon from '@mui/icons-material/KeyboardArrowRightOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RemoveOutlinedIcon from '@mui/icons-material/RemoveOutlined';

import theme, { BACKDROP_STYLE } from '../../theme';

const PAN_CONTROL_RADIUS = theme.spacing(10);

const PanButton: React.FunctionComponent<{ onActivateRepeat?: (multiplier: number) => void } & IconButtonProps> = ({ onActivateRepeat, sx, ...props }) => {
  const [mouseDown, setMouseDown] = useState<boolean>(false);

  useEffect(() => {
    if (mouseDown && onActivateRepeat) {
      const timeDown = Date.now();

      let animationFrame: number;
      const callback = () => {
        let multiplier = (Date.now() - timeDown) / 200;
        if (multiplier > 100) multiplier = 100;
        onActivateRepeat(multiplier);
        animationFrame = requestAnimationFrame(callback);
      }
      animationFrame = requestAnimationFrame(callback);

      return () => cancelAnimationFrame(animationFrame);
    }
    return () => { }
  }, [mouseDown, onActivateRepeat])

  return (
      <IconButton
        {...props}
        sx={{
          ...sx,
        }}
        onMouseDown={() => setMouseDown(true)}
        onMouseUp={() => setMouseDown(false)}
        onMouseLeave={() => setMouseDown(false)}
        onTouchStart={() => setMouseDown(true)}
        onTouchEnd={() => setMouseDown(false)}
        onTouchMove={() => setMouseDown(false)}
      />
  );
}

type Vector3d = Konva.Vector2d & { z: number };
type Props = { onPanZoom: (direction: Vector3d) => void, onHome: () => void };
const PanZoomControl: React.FunctionComponent<Props> = ({ onPanZoom, onHome }) => {
  const controlBase = {
    display: 'flex',
    ...BACKDROP_STYLE
  };

  const controlButtonBase = {
    width: theme.spacing(3), height: theme.spacing(3)
  };

  return (
    <Box
      sx={{
        position: 'relative',
        float: 'right',
        zIndex: 1,
        padding: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        top: theme.spacing(7)
      }}
    >
      {/* Cardinal Directions (X/Y) and Home */}
      <Box
        sx={{
          ...controlBase,
          borderRadius: '50%',
          width: PAN_CONTROL_RADIUS,
          height: PAN_CONTROL_RADIUS,
          alignItems: 'center',
          justifyContent: 'space-between',
          overflow: 'hidden'
        }}
      >
        <PanButton onActivateRepeat={(multiplier) => onPanZoom({ x: -multiplier, y: 0, z: 0 })} sx={controlButtonBase}><KeyboardArrowLeftOutlinedIcon /></PanButton>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '100%'
          }}
        >
          <PanButton onActivateRepeat={(multiplier) => onPanZoom({ x: 0, y: -multiplier, z: 0 })} sx={controlButtonBase}><KeyboardArrowUpOutlinedIcon /></PanButton>
          <PanButton onClick={onHome} sx={controlButtonBase}><HomeOutlinedIcon /></PanButton>
          <PanButton onActivateRepeat={(multiplier) => onPanZoom({ x: 0, y: multiplier, z: 0 })} sx={controlButtonBase}><KeyboardArrowDownOutlinedIcon /></PanButton>
        </Box>
        <PanButton onActivateRepeat={(multiplier) => onPanZoom({ x: multiplier, y: 0, z: 0 })} sx={controlButtonBase}><KeyboardArrowRightOutlinedIcon /></PanButton>
      </Box>

      {/* Zoom (z) */}
      <Box
        sx={{
          ...controlBase,
          flexDirection: 'column',
          marginTop: theme.spacing(2),
          borderRadius: theme.shape.borderRadius
        }}
      >
        <PanButton size="small" onActivateRepeat={(multiplier) => onPanZoom({ x: 0, y: 0, z: multiplier })}><AddOutlinedIcon /></PanButton>
        <PanButton size="small" onActivateRepeat={(multiplier) => onPanZoom({ x: 0, y: 0, z: -multiplier })}><RemoveOutlinedIcon /></PanButton>
      </Box>
    </Box>
  );
}
export default PanZoomControl;