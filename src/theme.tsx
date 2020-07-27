import { singletonHook } from 'react-singleton-hook';
import { useTheme } from 'sancho';
import { useState } from 'react';

export const SIDEBAR_WIDTH = 48;
export const SCENE_LIST_WIDTH = 240;
export const HEADER_HEIGHT = 56;
export const VISUAL_ASSET_SIZER_SIZE = 650;

export const useSceneSidebarOpen = singletonHook([true, () => { }], () => useState<boolean>(true));
export function useExtendedTheme() {
  const theme = useTheme();
  const [sceneSidebarOpen] = useSceneSidebarOpen();

  return {
    ...theme,
    headerHeight: HEADER_HEIGHT,
    sceneListWidth: sceneSidebarOpen ? SCENE_LIST_WIDTH : 0,
    sidebarWidth: SIDEBAR_WIDTH,
    visualAssetSizerSize: VISUAL_ASSET_SIZER_SIZE
  }
}