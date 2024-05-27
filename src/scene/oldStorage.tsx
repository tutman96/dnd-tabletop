import Konva from 'konva';
import globalStorage from '../storage';

export enum OldLayerType {
  ASSETS,
  FOG,
  TABLE_VIEW,
}
export interface OldILayer {
  id: string;
  type: OldLayerType;
  name: string;
  visible: boolean;
}
export interface OldIAssetLayer extends OldILayer {
  assets: Map<string, OldIAsset>;
}
export enum OldAssetType {
  IMAGE,
  VIDEO,
}

export interface OldIAssetCalibration {
  xOffset: number;
  yOffset: number;
  ppiX: number;
  ppiY: number;
}
export type OldAssetTransform = Konva.RectConfig & {rotation: number};

export interface OldIAsset {
  id: string;
  size: {width: number; height: number};
  transform: OldAssetTransform;
  overrideCalibration?: boolean;
  calibration?: OldIAssetCalibration;
  type: OldAssetType;
  snapToGrid?: boolean;
}

export enum OldPolygonType {
  FOG,
  FOG_CLEAR,
  LIGHT_OBSTRUCTION,
}
export interface OldIPolygon {
  type: OldPolygonType;
  verticies: Array<Konva.Vector2d>;
  visibleOnTable: boolean;
}
export interface OldILightSource {
  position: Konva.Vector2d;
  brightLightDistance?: number;
  dimLightDistance?: number;
}
export interface OldIFogLayer extends OldILayer {
  lightSources: Array<OldILightSource>;
  obstructionPolygons: Array<OldIPolygon>;
  fogPolygons: Array<OldIPolygon>;
  fogClearPolygons: Array<OldIPolygon>;
}

export interface OldTableOptions {
  displayGrid: boolean;
  offset: Konva.Vector2d;
  rotation: number;
  scale: number;
}

export interface OldIScene {
  id: string;
  name: string;
  version: number;
  table: OldTableOptions;
  layers: Array<OldILayer>;
}

export const oldStorage = globalStorage<OldIScene>('scene');
