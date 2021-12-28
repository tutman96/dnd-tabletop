import { singletonHook } from 'react-singleton-hook';
import { createTheme } from '@mui/material/styles';
import { useState } from 'react';
import { grey } from '@mui/material/colors';

export const SIDEBAR_WIDTH = 48;
export const SCENE_LIST_WIDTH = 240;
export const HEADER_HEIGHT = 64;
export const VISUAL_ASSET_SIZER_SIZE = 650;

export const useSceneSidebarOpen = singletonHook([true, () => { }], () => useState<boolean>(true));

export const theme = createTheme({
  palette: {
    mode: 'dark',
    secondary: grey,
    error: {
      main: '#db292f',
      dark: '#991c20',
      light: '#e25358'
    }
  },
  shape: {
    borderRadius: 8
  }
});
export default theme;