import React from 'react';

import IconButton from '@mui/material/IconButton';

import Favicon from './favicon';
import theme from '../theme';

const FloatingIcon: React.FunctionComponent<{
  onClick: () => void;
  active: boolean;
}> = ({onClick, active}) => {
  return (
    <IconButton
      sx={{
        position: 'fixed',
        margin: theme.spacing(1),
        top: 0,
        left: 0,
        zIndex: theme.zIndex.appBar + 2,
        cursor: 'pointer',
      }}
      onClick={onClick}
    >
      <Favicon active={active} />
    </IconButton>
  );
};

export default FloatingIcon;
