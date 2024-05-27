import React from 'react';

import Box from '@mui/material/Box';
import type {SxProps} from '@mui/material';

import {theme} from '../theme';

const transition = theme.transitions.create('opacity');
const FAVICON_SIZE = theme.spacing(4);

type Props = {active: boolean; sx?: SxProps};
const Favicon: React.FunctionComponent<Props> = ({active, sx}) => {
  return (
    <Box
      sx={{
        ...sx,
        width: FAVICON_SIZE,
        height: FAVICON_SIZE,
      }}
    >
      <img
        width={FAVICON_SIZE}
        height={FAVICON_SIZE}
        src="favicon.png"
        alt="home icon"
        style={{
          transition,
          opacity: active ? 1 : 0,
          position: 'relative',
        }}
      />
      <img
        width={FAVICON_SIZE}
        height={FAVICON_SIZE}
        src="favicon-outlined.png"
        alt="home icon"
        style={{
          transition,
          opacity: active ? 0 : 1,
          position: 'relative',
          top: -38, // Magic Number
        }}
      />
    </Box>
  );
};
export default Favicon;
