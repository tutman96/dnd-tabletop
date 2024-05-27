import React from 'react';

import Box from '@mui/material/Box';

import theme from '../../theme';

const Toolbar: React.FunctionComponent<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: theme.zIndex.appBar,
        height: theme.spacing(8),
        pointerEvents: 'none',
      }}
    >
      <Box
        sx={{
          pointerEvents: 'initial',
          '> span': {
            display: 'flex',
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
export default Toolbar;
