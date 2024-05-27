import React from 'react';

import Button from '@mui/material/Button';

import Download from '@mui/icons-material/Download';

import {exportAllScenes} from '.';

const ExportAllButton: React.FunctionComponent = () => {
  return (
    <Button
      startIcon={<Download />}
      variant="outlined"
      onClick={() => exportAllScenes()}
    >
      Download All Scenes
    </Button>
  );
};
export default ExportAllButton;
