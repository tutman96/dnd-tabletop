import { singletonHook } from 'react-singleton-hook';
import { createTheme } from '@mui/material/styles';
import { useTheme } from 'sancho';
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
    secondary: grey
  },
  shape: {
    borderRadius: 8
  }
});
export default theme;


export function useExtendedTheme() {
  const theme = useTheme();

  return {
    ...theme,
    headerHeight: HEADER_HEIGHT,
    visualAssetSizerSize: VISUAL_ASSET_SIZER_SIZE
  }
}