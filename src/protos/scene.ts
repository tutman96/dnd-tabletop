/* eslint-disable */
import Long from "long";
import * as _m0 from "protobufjs/minimal";

export const protobufPackage = "";

export interface Scene {
  id: string;
  name: string;
  version: number;
  table: TableOptions | undefined;
  layers: Layer[];
}

export interface TableOptions {
  displayGrid: boolean;
  offset: Vector2d | undefined;
  rotation: number;
  scale: number;
}

export interface Vector2d {
  x: number;
  y: number;
}

export interface Layer {
  assetLayer: AssetLayer | undefined;
  fogLayer: FogLayer | undefined;
}

export enum Layer_LayerType {
  ASSETS = 0,
  FOG = 1,
  UNRECOGNIZED = -1,
}

export function layer_LayerTypeFromJSON(object: any): Layer_LayerType {
  switch (object) {
    case 0:
    case "ASSETS":
      return Layer_LayerType.ASSETS;
    case 1:
    case "FOG":
      return Layer_LayerType.FOG;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Layer_LayerType.UNRECOGNIZED;
  }
}

export function layer_LayerTypeToJSON(object: Layer_LayerType): string {
  switch (object) {
    case Layer_LayerType.ASSETS:
      return "ASSETS";
    case Layer_LayerType.FOG:
      return "FOG";
    case Layer_LayerType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface AssetLayer {
  id: string;
  name: string;
  visible: boolean;
  type: Layer_LayerType;
  assets: { [key: string]: AssetLayer_Asset };
}

export interface AssetLayer_AssetsEntry {
  key: string;
  value: AssetLayer_Asset | undefined;
}

export interface AssetLayer_Asset {
  id: string;
  type: AssetLayer_Asset_AssetType;
  size: AssetLayer_Asset_AssetSize | undefined;
  transform: AssetLayer_Asset_AssetTransform | undefined;
  calibration?: AssetLayer_Asset_AssetCalibration | undefined;
  snapToGrid?: boolean | undefined;
}

export enum AssetLayer_Asset_AssetType {
  IMAGE = 0,
  VIDEO = 1,
  UNRECOGNIZED = -1,
}

export function assetLayer_Asset_AssetTypeFromJSON(
  object: any
): AssetLayer_Asset_AssetType {
  switch (object) {
    case 0:
    case "IMAGE":
      return AssetLayer_Asset_AssetType.IMAGE;
    case 1:
    case "VIDEO":
      return AssetLayer_Asset_AssetType.VIDEO;
    case -1:
    case "UNRECOGNIZED":
    default:
      return AssetLayer_Asset_AssetType.UNRECOGNIZED;
  }
}

export function assetLayer_Asset_AssetTypeToJSON(
  object: AssetLayer_Asset_AssetType
): string {
  switch (object) {
    case AssetLayer_Asset_AssetType.IMAGE:
      return "IMAGE";
    case AssetLayer_Asset_AssetType.VIDEO:
      return "VIDEO";
    case AssetLayer_Asset_AssetType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface AssetLayer_Asset_AssetSize {
  width: number;
  height: number;
}

export interface AssetLayer_Asset_AssetTransform {
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
}

export interface AssetLayer_Asset_AssetCalibration {
  xOffset: number;
  yOffset: number;
  ppiX: number;
  ppiY: number;
}

export interface FogLayer {
  id: string;
  name: string;
  visible: boolean;
  type: Layer_LayerType;
  lightSources: FogLayer_LightSource[];
  obstructionPolygons: FogLayer_Polygon[];
  fogPolygons: FogLayer_Polygon[];
  fogClearPolygons: FogLayer_Polygon[];
}

export interface FogLayer_LightSource {
  position: Vector2d | undefined;
  brightLightDistance: number;
  dimLightDistance: number;
}

export interface FogLayer_Polygon {
  type: FogLayer_Polygon_PolygonType;
  verticies: Vector2d[];
  visibleOnTable: boolean;
}

export enum FogLayer_Polygon_PolygonType {
  FOG = 0,
  FOG_CLEAR = 1,
  LIGHT_OBSTRUCTION = 2,
  UNRECOGNIZED = -1,
}

export function fogLayer_Polygon_PolygonTypeFromJSON(
  object: any
): FogLayer_Polygon_PolygonType {
  switch (object) {
    case 0:
    case "FOG":
      return FogLayer_Polygon_PolygonType.FOG;
    case 1:
    case "FOG_CLEAR":
      return FogLayer_Polygon_PolygonType.FOG_CLEAR;
    case 2:
    case "LIGHT_OBSTRUCTION":
      return FogLayer_Polygon_PolygonType.LIGHT_OBSTRUCTION;
    case -1:
    case "UNRECOGNIZED":
    default:
      return FogLayer_Polygon_PolygonType.UNRECOGNIZED;
  }
}

export function fogLayer_Polygon_PolygonTypeToJSON(
  object: FogLayer_Polygon_PolygonType
): string {
  switch (object) {
    case FogLayer_Polygon_PolygonType.FOG:
      return "FOG";
    case FogLayer_Polygon_PolygonType.FOG_CLEAR:
      return "FOG_CLEAR";
    case FogLayer_Polygon_PolygonType.LIGHT_OBSTRUCTION:
      return "LIGHT_OBSTRUCTION";
    case FogLayer_Polygon_PolygonType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface SceneExport {
  scene: Scene | undefined;
  files: SceneExport_File[];
}

export interface SceneExport_File {
  id: string;
  payload: Uint8Array;
  mediaType: string;
}

function createBaseScene(): Scene {
  return { id: "", name: "", version: 0, table: undefined, layers: [] };
}

export const Scene = {
  encode(message: Scene, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.version !== 0) {
      writer.uint32(24).uint64(message.version);
    }
    if (message.table !== undefined) {
      TableOptions.encode(message.table, writer.uint32(34).fork()).ldelim();
    }
    for (const v of message.layers) {
      Layer.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Scene {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseScene();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.name = reader.string();
          break;
        case 3:
          message.version = longToNumber(reader.uint64() as Long);
          break;
        case 4:
          message.table = TableOptions.decode(reader, reader.uint32());
          break;
        case 5:
          message.layers.push(Layer.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Scene {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      name: isSet(object.name) ? String(object.name) : "",
      version: isSet(object.version) ? Number(object.version) : 0,
      table: isSet(object.table)
        ? TableOptions.fromJSON(object.table)
        : undefined,
      layers: Array.isArray(object?.layers)
        ? object.layers.map((e: any) => Layer.fromJSON(e))
        : [],
    };
  },

  toJSON(message: Scene): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.name !== undefined && (obj.name = message.name);
    message.version !== undefined &&
      (obj.version = Math.round(message.version));
    message.table !== undefined &&
      (obj.table = message.table
        ? TableOptions.toJSON(message.table)
        : undefined);
    if (message.layers) {
      obj.layers = message.layers.map((e) => (e ? Layer.toJSON(e) : undefined));
    } else {
      obj.layers = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Scene>, I>>(object: I): Scene {
    const message = createBaseScene();
    message.id = object.id ?? "";
    message.name = object.name ?? "";
    message.version = object.version ?? 0;
    message.table =
      object.table !== undefined && object.table !== null
        ? TableOptions.fromPartial(object.table)
        : undefined;
    message.layers = object.layers?.map((e) => Layer.fromPartial(e)) || [];
    return message;
  },
};

function createBaseTableOptions(): TableOptions {
  return { displayGrid: false, offset: undefined, rotation: 0, scale: 0 };
}

export const TableOptions = {
  encode(
    message: TableOptions,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.displayGrid === true) {
      writer.uint32(8).bool(message.displayGrid);
    }
    if (message.offset !== undefined) {
      Vector2d.encode(message.offset, writer.uint32(18).fork()).ldelim();
    }
    if (message.rotation !== 0) {
      writer.uint32(25).double(message.rotation);
    }
    if (message.scale !== 0) {
      writer.uint32(33).double(message.scale);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TableOptions {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTableOptions();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.displayGrid = reader.bool();
          break;
        case 2:
          message.offset = Vector2d.decode(reader, reader.uint32());
          break;
        case 3:
          message.rotation = reader.double();
          break;
        case 4:
          message.scale = reader.double();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): TableOptions {
    return {
      displayGrid: isSet(object.displayGrid)
        ? Boolean(object.displayGrid)
        : false,
      offset: isSet(object.offset)
        ? Vector2d.fromJSON(object.offset)
        : undefined,
      rotation: isSet(object.rotation) ? Number(object.rotation) : 0,
      scale: isSet(object.scale) ? Number(object.scale) : 0,
    };
  },

  toJSON(message: TableOptions): unknown {
    const obj: any = {};
    message.displayGrid !== undefined &&
      (obj.displayGrid = message.displayGrid);
    message.offset !== undefined &&
      (obj.offset = message.offset
        ? Vector2d.toJSON(message.offset)
        : undefined);
    message.rotation !== undefined && (obj.rotation = message.rotation);
    message.scale !== undefined && (obj.scale = message.scale);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<TableOptions>, I>>(
    object: I
  ): TableOptions {
    const message = createBaseTableOptions();
    message.displayGrid = object.displayGrid ?? false;
    message.offset =
      object.offset !== undefined && object.offset !== null
        ? Vector2d.fromPartial(object.offset)
        : undefined;
    message.rotation = object.rotation ?? 0;
    message.scale = object.scale ?? 0;
    return message;
  },
};

function createBaseVector2d(): Vector2d {
  return { x: 0, y: 0 };
}

export const Vector2d = {
  encode(
    message: Vector2d,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.x !== 0) {
      writer.uint32(9).double(message.x);
    }
    if (message.y !== 0) {
      writer.uint32(17).double(message.y);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Vector2d {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseVector2d();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.x = reader.double();
          break;
        case 2:
          message.y = reader.double();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Vector2d {
    return {
      x: isSet(object.x) ? Number(object.x) : 0,
      y: isSet(object.y) ? Number(object.y) : 0,
    };
  },

  toJSON(message: Vector2d): unknown {
    const obj: any = {};
    message.x !== undefined && (obj.x = message.x);
    message.y !== undefined && (obj.y = message.y);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Vector2d>, I>>(object: I): Vector2d {
    const message = createBaseVector2d();
    message.x = object.x ?? 0;
    message.y = object.y ?? 0;
    return message;
  },
};

function createBaseLayer(): Layer {
  return { assetLayer: undefined, fogLayer: undefined };
}

export const Layer = {
  encode(message: Layer, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.assetLayer !== undefined) {
      AssetLayer.encode(message.assetLayer, writer.uint32(10).fork()).ldelim();
    }
    if (message.fogLayer !== undefined) {
      FogLayer.encode(message.fogLayer, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Layer {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLayer();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.assetLayer = AssetLayer.decode(reader, reader.uint32());
          break;
        case 2:
          message.fogLayer = FogLayer.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Layer {
    return {
      assetLayer: isSet(object.assetLayer)
        ? AssetLayer.fromJSON(object.assetLayer)
        : undefined,
      fogLayer: isSet(object.fogLayer)
        ? FogLayer.fromJSON(object.fogLayer)
        : undefined,
    };
  },

  toJSON(message: Layer): unknown {
    const obj: any = {};
    message.assetLayer !== undefined &&
      (obj.assetLayer = message.assetLayer
        ? AssetLayer.toJSON(message.assetLayer)
        : undefined);
    message.fogLayer !== undefined &&
      (obj.fogLayer = message.fogLayer
        ? FogLayer.toJSON(message.fogLayer)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Layer>, I>>(object: I): Layer {
    const message = createBaseLayer();
    message.assetLayer =
      object.assetLayer !== undefined && object.assetLayer !== null
        ? AssetLayer.fromPartial(object.assetLayer)
        : undefined;
    message.fogLayer =
      object.fogLayer !== undefined && object.fogLayer !== null
        ? FogLayer.fromPartial(object.fogLayer)
        : undefined;
    return message;
  },
};

function createBaseAssetLayer(): AssetLayer {
  return { id: "", name: "", visible: false, type: 0, assets: {} };
}

export const AssetLayer = {
  encode(
    message: AssetLayer,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.name !== "") {
      writer.uint32(26).string(message.name);
    }
    if (message.visible === true) {
      writer.uint32(32).bool(message.visible);
    }
    if (message.type !== 0) {
      writer.uint32(40).int32(message.type);
    }
    Object.entries(message.assets).forEach(([key, value]) => {
      AssetLayer_AssetsEntry.encode(
        { key: key as any, value },
        writer.uint32(50).fork()
      ).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AssetLayer {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAssetLayer();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 3:
          message.name = reader.string();
          break;
        case 4:
          message.visible = reader.bool();
          break;
        case 5:
          message.type = reader.int32() as any;
          break;
        case 6:
          const entry6 = AssetLayer_AssetsEntry.decode(reader, reader.uint32());
          if (entry6.value !== undefined) {
            message.assets[entry6.key] = entry6.value;
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AssetLayer {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      name: isSet(object.name) ? String(object.name) : "",
      visible: isSet(object.visible) ? Boolean(object.visible) : false,
      type: isSet(object.type) ? layer_LayerTypeFromJSON(object.type) : 0,
      assets: isObject(object.assets)
        ? Object.entries(object.assets).reduce<{
            [key: string]: AssetLayer_Asset;
          }>((acc, [key, value]) => {
            acc[key] = AssetLayer_Asset.fromJSON(value);
            return acc;
          }, {})
        : {},
    };
  },

  toJSON(message: AssetLayer): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.name !== undefined && (obj.name = message.name);
    message.visible !== undefined && (obj.visible = message.visible);
    message.type !== undefined &&
      (obj.type = layer_LayerTypeToJSON(message.type));
    obj.assets = {};
    if (message.assets) {
      Object.entries(message.assets).forEach(([k, v]) => {
        obj.assets[k] = AssetLayer_Asset.toJSON(v);
      });
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<AssetLayer>, I>>(
    object: I
  ): AssetLayer {
    const message = createBaseAssetLayer();
    message.id = object.id ?? "";
    message.name = object.name ?? "";
    message.visible = object.visible ?? false;
    message.type = object.type ?? 0;
    message.assets = Object.entries(object.assets ?? {}).reduce<{
      [key: string]: AssetLayer_Asset;
    }>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = AssetLayer_Asset.fromPartial(value);
      }
      return acc;
    }, {});
    return message;
  },
};

function createBaseAssetLayer_AssetsEntry(): AssetLayer_AssetsEntry {
  return { key: "", value: undefined };
}

export const AssetLayer_AssetsEntry = {
  encode(
    message: AssetLayer_AssetsEntry,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      AssetLayer_Asset.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): AssetLayer_AssetsEntry {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAssetLayer_AssetsEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.value = AssetLayer_Asset.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AssetLayer_AssetsEntry {
    return {
      key: isSet(object.key) ? String(object.key) : "",
      value: isSet(object.value)
        ? AssetLayer_Asset.fromJSON(object.value)
        : undefined,
    };
  },

  toJSON(message: AssetLayer_AssetsEntry): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined &&
      (obj.value = message.value
        ? AssetLayer_Asset.toJSON(message.value)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<AssetLayer_AssetsEntry>, I>>(
    object: I
  ): AssetLayer_AssetsEntry {
    const message = createBaseAssetLayer_AssetsEntry();
    message.key = object.key ?? "";
    message.value =
      object.value !== undefined && object.value !== null
        ? AssetLayer_Asset.fromPartial(object.value)
        : undefined;
    return message;
  },
};

function createBaseAssetLayer_Asset(): AssetLayer_Asset {
  return {
    id: "",
    type: 0,
    size: undefined,
    transform: undefined,
    calibration: undefined,
    snapToGrid: undefined,
  };
}

export const AssetLayer_Asset = {
  encode(
    message: AssetLayer_Asset,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.type !== 0) {
      writer.uint32(16).int32(message.type);
    }
    if (message.size !== undefined) {
      AssetLayer_Asset_AssetSize.encode(
        message.size,
        writer.uint32(26).fork()
      ).ldelim();
    }
    if (message.transform !== undefined) {
      AssetLayer_Asset_AssetTransform.encode(
        message.transform,
        writer.uint32(34).fork()
      ).ldelim();
    }
    if (message.calibration !== undefined) {
      AssetLayer_Asset_AssetCalibration.encode(
        message.calibration,
        writer.uint32(42).fork()
      ).ldelim();
    }
    if (message.snapToGrid !== undefined) {
      writer.uint32(48).bool(message.snapToGrid);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AssetLayer_Asset {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAssetLayer_Asset();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.type = reader.int32() as any;
          break;
        case 3:
          message.size = AssetLayer_Asset_AssetSize.decode(
            reader,
            reader.uint32()
          );
          break;
        case 4:
          message.transform = AssetLayer_Asset_AssetTransform.decode(
            reader,
            reader.uint32()
          );
          break;
        case 5:
          message.calibration = AssetLayer_Asset_AssetCalibration.decode(
            reader,
            reader.uint32()
          );
          break;
        case 6:
          message.snapToGrid = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AssetLayer_Asset {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      type: isSet(object.type)
        ? assetLayer_Asset_AssetTypeFromJSON(object.type)
        : 0,
      size: isSet(object.size)
        ? AssetLayer_Asset_AssetSize.fromJSON(object.size)
        : undefined,
      transform: isSet(object.transform)
        ? AssetLayer_Asset_AssetTransform.fromJSON(object.transform)
        : undefined,
      calibration: isSet(object.calibration)
        ? AssetLayer_Asset_AssetCalibration.fromJSON(object.calibration)
        : undefined,
      snapToGrid: isSet(object.snapToGrid)
        ? Boolean(object.snapToGrid)
        : undefined,
    };
  },

  toJSON(message: AssetLayer_Asset): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.type !== undefined &&
      (obj.type = assetLayer_Asset_AssetTypeToJSON(message.type));
    message.size !== undefined &&
      (obj.size = message.size
        ? AssetLayer_Asset_AssetSize.toJSON(message.size)
        : undefined);
    message.transform !== undefined &&
      (obj.transform = message.transform
        ? AssetLayer_Asset_AssetTransform.toJSON(message.transform)
        : undefined);
    message.calibration !== undefined &&
      (obj.calibration = message.calibration
        ? AssetLayer_Asset_AssetCalibration.toJSON(message.calibration)
        : undefined);
    message.snapToGrid !== undefined && (obj.snapToGrid = message.snapToGrid);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<AssetLayer_Asset>, I>>(
    object: I
  ): AssetLayer_Asset {
    const message = createBaseAssetLayer_Asset();
    message.id = object.id ?? "";
    message.type = object.type ?? 0;
    message.size =
      object.size !== undefined && object.size !== null
        ? AssetLayer_Asset_AssetSize.fromPartial(object.size)
        : undefined;
    message.transform =
      object.transform !== undefined && object.transform !== null
        ? AssetLayer_Asset_AssetTransform.fromPartial(object.transform)
        : undefined;
    message.calibration =
      object.calibration !== undefined && object.calibration !== null
        ? AssetLayer_Asset_AssetCalibration.fromPartial(object.calibration)
        : undefined;
    message.snapToGrid = object.snapToGrid ?? undefined;
    return message;
  },
};

function createBaseAssetLayer_Asset_AssetSize(): AssetLayer_Asset_AssetSize {
  return { width: 0, height: 0 };
}

export const AssetLayer_Asset_AssetSize = {
  encode(
    message: AssetLayer_Asset_AssetSize,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.width !== 0) {
      writer.uint32(9).double(message.width);
    }
    if (message.height !== 0) {
      writer.uint32(17).double(message.height);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): AssetLayer_Asset_AssetSize {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAssetLayer_Asset_AssetSize();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.width = reader.double();
          break;
        case 2:
          message.height = reader.double();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AssetLayer_Asset_AssetSize {
    return {
      width: isSet(object.width) ? Number(object.width) : 0,
      height: isSet(object.height) ? Number(object.height) : 0,
    };
  },

  toJSON(message: AssetLayer_Asset_AssetSize): unknown {
    const obj: any = {};
    message.width !== undefined && (obj.width = message.width);
    message.height !== undefined && (obj.height = message.height);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<AssetLayer_Asset_AssetSize>, I>>(
    object: I
  ): AssetLayer_Asset_AssetSize {
    const message = createBaseAssetLayer_Asset_AssetSize();
    message.width = object.width ?? 0;
    message.height = object.height ?? 0;
    return message;
  },
};

function createBaseAssetLayer_Asset_AssetTransform(): AssetLayer_Asset_AssetTransform {
  return { x: 0, y: 0, rotation: 0, width: 0, height: 0 };
}

export const AssetLayer_Asset_AssetTransform = {
  encode(
    message: AssetLayer_Asset_AssetTransform,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.x !== 0) {
      writer.uint32(9).double(message.x);
    }
    if (message.y !== 0) {
      writer.uint32(17).double(message.y);
    }
    if (message.rotation !== 0) {
      writer.uint32(25).double(message.rotation);
    }
    if (message.width !== 0) {
      writer.uint32(33).double(message.width);
    }
    if (message.height !== 0) {
      writer.uint32(41).double(message.height);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): AssetLayer_Asset_AssetTransform {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAssetLayer_Asset_AssetTransform();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.x = reader.double();
          break;
        case 2:
          message.y = reader.double();
          break;
        case 3:
          message.rotation = reader.double();
          break;
        case 4:
          message.width = reader.double();
          break;
        case 5:
          message.height = reader.double();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AssetLayer_Asset_AssetTransform {
    return {
      x: isSet(object.x) ? Number(object.x) : 0,
      y: isSet(object.y) ? Number(object.y) : 0,
      rotation: isSet(object.rotation) ? Number(object.rotation) : 0,
      width: isSet(object.width) ? Number(object.width) : 0,
      height: isSet(object.height) ? Number(object.height) : 0,
    };
  },

  toJSON(message: AssetLayer_Asset_AssetTransform): unknown {
    const obj: any = {};
    message.x !== undefined && (obj.x = message.x);
    message.y !== undefined && (obj.y = message.y);
    message.rotation !== undefined && (obj.rotation = message.rotation);
    message.width !== undefined && (obj.width = message.width);
    message.height !== undefined && (obj.height = message.height);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<AssetLayer_Asset_AssetTransform>, I>>(
    object: I
  ): AssetLayer_Asset_AssetTransform {
    const message = createBaseAssetLayer_Asset_AssetTransform();
    message.x = object.x ?? 0;
    message.y = object.y ?? 0;
    message.rotation = object.rotation ?? 0;
    message.width = object.width ?? 0;
    message.height = object.height ?? 0;
    return message;
  },
};

function createBaseAssetLayer_Asset_AssetCalibration(): AssetLayer_Asset_AssetCalibration {
  return { xOffset: 0, yOffset: 0, ppiX: 0, ppiY: 0 };
}

export const AssetLayer_Asset_AssetCalibration = {
  encode(
    message: AssetLayer_Asset_AssetCalibration,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.xOffset !== 0) {
      writer.uint32(13).float(message.xOffset);
    }
    if (message.yOffset !== 0) {
      writer.uint32(21).float(message.yOffset);
    }
    if (message.ppiX !== 0) {
      writer.uint32(29).float(message.ppiX);
    }
    if (message.ppiY !== 0) {
      writer.uint32(37).float(message.ppiY);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): AssetLayer_Asset_AssetCalibration {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAssetLayer_Asset_AssetCalibration();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.xOffset = reader.float();
          break;
        case 2:
          message.yOffset = reader.float();
          break;
        case 3:
          message.ppiX = reader.float();
          break;
        case 4:
          message.ppiY = reader.float();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AssetLayer_Asset_AssetCalibration {
    return {
      xOffset: isSet(object.xOffset) ? Number(object.xOffset) : 0,
      yOffset: isSet(object.yOffset) ? Number(object.yOffset) : 0,
      ppiX: isSet(object.ppiX) ? Number(object.ppiX) : 0,
      ppiY: isSet(object.ppiY) ? Number(object.ppiY) : 0,
    };
  },

  toJSON(message: AssetLayer_Asset_AssetCalibration): unknown {
    const obj: any = {};
    message.xOffset !== undefined && (obj.xOffset = message.xOffset);
    message.yOffset !== undefined && (obj.yOffset = message.yOffset);
    message.ppiX !== undefined && (obj.ppiX = message.ppiX);
    message.ppiY !== undefined && (obj.ppiY = message.ppiY);
    return obj;
  },

  fromPartial<
    I extends Exact<DeepPartial<AssetLayer_Asset_AssetCalibration>, I>
  >(object: I): AssetLayer_Asset_AssetCalibration {
    const message = createBaseAssetLayer_Asset_AssetCalibration();
    message.xOffset = object.xOffset ?? 0;
    message.yOffset = object.yOffset ?? 0;
    message.ppiX = object.ppiX ?? 0;
    message.ppiY = object.ppiY ?? 0;
    return message;
  },
};

function createBaseFogLayer(): FogLayer {
  return {
    id: "",
    name: "",
    visible: false,
    type: 0,
    lightSources: [],
    obstructionPolygons: [],
    fogPolygons: [],
    fogClearPolygons: [],
  };
}

export const FogLayer = {
  encode(
    message: FogLayer,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.name !== "") {
      writer.uint32(26).string(message.name);
    }
    if (message.visible === true) {
      writer.uint32(32).bool(message.visible);
    }
    if (message.type !== 0) {
      writer.uint32(40).int32(message.type);
    }
    for (const v of message.lightSources) {
      FogLayer_LightSource.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    for (const v of message.obstructionPolygons) {
      FogLayer_Polygon.encode(v!, writer.uint32(58).fork()).ldelim();
    }
    for (const v of message.fogPolygons) {
      FogLayer_Polygon.encode(v!, writer.uint32(66).fork()).ldelim();
    }
    for (const v of message.fogClearPolygons) {
      FogLayer_Polygon.encode(v!, writer.uint32(74).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FogLayer {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFogLayer();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 3:
          message.name = reader.string();
          break;
        case 4:
          message.visible = reader.bool();
          break;
        case 5:
          message.type = reader.int32() as any;
          break;
        case 6:
          message.lightSources.push(
            FogLayer_LightSource.decode(reader, reader.uint32())
          );
          break;
        case 7:
          message.obstructionPolygons.push(
            FogLayer_Polygon.decode(reader, reader.uint32())
          );
          break;
        case 8:
          message.fogPolygons.push(
            FogLayer_Polygon.decode(reader, reader.uint32())
          );
          break;
        case 9:
          message.fogClearPolygons.push(
            FogLayer_Polygon.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): FogLayer {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      name: isSet(object.name) ? String(object.name) : "",
      visible: isSet(object.visible) ? Boolean(object.visible) : false,
      type: isSet(object.type) ? layer_LayerTypeFromJSON(object.type) : 0,
      lightSources: Array.isArray(object?.lightSources)
        ? object.lightSources.map((e: any) => FogLayer_LightSource.fromJSON(e))
        : [],
      obstructionPolygons: Array.isArray(object?.obstructionPolygons)
        ? object.obstructionPolygons.map((e: any) =>
            FogLayer_Polygon.fromJSON(e)
          )
        : [],
      fogPolygons: Array.isArray(object?.fogPolygons)
        ? object.fogPolygons.map((e: any) => FogLayer_Polygon.fromJSON(e))
        : [],
      fogClearPolygons: Array.isArray(object?.fogClearPolygons)
        ? object.fogClearPolygons.map((e: any) => FogLayer_Polygon.fromJSON(e))
        : [],
    };
  },

  toJSON(message: FogLayer): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.name !== undefined && (obj.name = message.name);
    message.visible !== undefined && (obj.visible = message.visible);
    message.type !== undefined &&
      (obj.type = layer_LayerTypeToJSON(message.type));
    if (message.lightSources) {
      obj.lightSources = message.lightSources.map((e) =>
        e ? FogLayer_LightSource.toJSON(e) : undefined
      );
    } else {
      obj.lightSources = [];
    }
    if (message.obstructionPolygons) {
      obj.obstructionPolygons = message.obstructionPolygons.map((e) =>
        e ? FogLayer_Polygon.toJSON(e) : undefined
      );
    } else {
      obj.obstructionPolygons = [];
    }
    if (message.fogPolygons) {
      obj.fogPolygons = message.fogPolygons.map((e) =>
        e ? FogLayer_Polygon.toJSON(e) : undefined
      );
    } else {
      obj.fogPolygons = [];
    }
    if (message.fogClearPolygons) {
      obj.fogClearPolygons = message.fogClearPolygons.map((e) =>
        e ? FogLayer_Polygon.toJSON(e) : undefined
      );
    } else {
      obj.fogClearPolygons = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<FogLayer>, I>>(object: I): FogLayer {
    const message = createBaseFogLayer();
    message.id = object.id ?? "";
    message.name = object.name ?? "";
    message.visible = object.visible ?? false;
    message.type = object.type ?? 0;
    message.lightSources =
      object.lightSources?.map((e) => FogLayer_LightSource.fromPartial(e)) ||
      [];
    message.obstructionPolygons =
      object.obstructionPolygons?.map((e) => FogLayer_Polygon.fromPartial(e)) ||
      [];
    message.fogPolygons =
      object.fogPolygons?.map((e) => FogLayer_Polygon.fromPartial(e)) || [];
    message.fogClearPolygons =
      object.fogClearPolygons?.map((e) => FogLayer_Polygon.fromPartial(e)) ||
      [];
    return message;
  },
};

function createBaseFogLayer_LightSource(): FogLayer_LightSource {
  return { position: undefined, brightLightDistance: 0, dimLightDistance: 0 };
}

export const FogLayer_LightSource = {
  encode(
    message: FogLayer_LightSource,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.position !== undefined) {
      Vector2d.encode(message.position, writer.uint32(10).fork()).ldelim();
    }
    if (message.brightLightDistance !== 0) {
      writer.uint32(21).float(message.brightLightDistance);
    }
    if (message.dimLightDistance !== 0) {
      writer.uint32(29).float(message.dimLightDistance);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): FogLayer_LightSource {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFogLayer_LightSource();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.position = Vector2d.decode(reader, reader.uint32());
          break;
        case 2:
          message.brightLightDistance = reader.float();
          break;
        case 3:
          message.dimLightDistance = reader.float();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): FogLayer_LightSource {
    return {
      position: isSet(object.position)
        ? Vector2d.fromJSON(object.position)
        : undefined,
      brightLightDistance: isSet(object.brightLightDistance)
        ? Number(object.brightLightDistance)
        : 0,
      dimLightDistance: isSet(object.dimLightDistance)
        ? Number(object.dimLightDistance)
        : 0,
    };
  },

  toJSON(message: FogLayer_LightSource): unknown {
    const obj: any = {};
    message.position !== undefined &&
      (obj.position = message.position
        ? Vector2d.toJSON(message.position)
        : undefined);
    message.brightLightDistance !== undefined &&
      (obj.brightLightDistance = message.brightLightDistance);
    message.dimLightDistance !== undefined &&
      (obj.dimLightDistance = message.dimLightDistance);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<FogLayer_LightSource>, I>>(
    object: I
  ): FogLayer_LightSource {
    const message = createBaseFogLayer_LightSource();
    message.position =
      object.position !== undefined && object.position !== null
        ? Vector2d.fromPartial(object.position)
        : undefined;
    message.brightLightDistance = object.brightLightDistance ?? 0;
    message.dimLightDistance = object.dimLightDistance ?? 0;
    return message;
  },
};

function createBaseFogLayer_Polygon(): FogLayer_Polygon {
  return { type: 0, verticies: [], visibleOnTable: false };
}

export const FogLayer_Polygon = {
  encode(
    message: FogLayer_Polygon,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.type !== 0) {
      writer.uint32(8).int32(message.type);
    }
    for (const v of message.verticies) {
      Vector2d.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.visibleOnTable === true) {
      writer.uint32(24).bool(message.visibleOnTable);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FogLayer_Polygon {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFogLayer_Polygon();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.type = reader.int32() as any;
          break;
        case 2:
          message.verticies.push(Vector2d.decode(reader, reader.uint32()));
          break;
        case 3:
          message.visibleOnTable = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): FogLayer_Polygon {
    return {
      type: isSet(object.type)
        ? fogLayer_Polygon_PolygonTypeFromJSON(object.type)
        : 0,
      verticies: Array.isArray(object?.verticies)
        ? object.verticies.map((e: any) => Vector2d.fromJSON(e))
        : [],
      visibleOnTable: isSet(object.visibleOnTable)
        ? Boolean(object.visibleOnTable)
        : false,
    };
  },

  toJSON(message: FogLayer_Polygon): unknown {
    const obj: any = {};
    message.type !== undefined &&
      (obj.type = fogLayer_Polygon_PolygonTypeToJSON(message.type));
    if (message.verticies) {
      obj.verticies = message.verticies.map((e) =>
        e ? Vector2d.toJSON(e) : undefined
      );
    } else {
      obj.verticies = [];
    }
    message.visibleOnTable !== undefined &&
      (obj.visibleOnTable = message.visibleOnTable);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<FogLayer_Polygon>, I>>(
    object: I
  ): FogLayer_Polygon {
    const message = createBaseFogLayer_Polygon();
    message.type = object.type ?? 0;
    message.verticies =
      object.verticies?.map((e) => Vector2d.fromPartial(e)) || [];
    message.visibleOnTable = object.visibleOnTable ?? false;
    return message;
  },
};

function createBaseSceneExport(): SceneExport {
  return { scene: undefined, files: [] };
}

export const SceneExport = {
  encode(
    message: SceneExport,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.scene !== undefined) {
      Scene.encode(message.scene, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.files) {
      SceneExport_File.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SceneExport {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSceneExport();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.scene = Scene.decode(reader, reader.uint32());
          break;
        case 2:
          message.files.push(SceneExport_File.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): SceneExport {
    return {
      scene: isSet(object.scene) ? Scene.fromJSON(object.scene) : undefined,
      files: Array.isArray(object?.files)
        ? object.files.map((e: any) => SceneExport_File.fromJSON(e))
        : [],
    };
  },

  toJSON(message: SceneExport): unknown {
    const obj: any = {};
    message.scene !== undefined &&
      (obj.scene = message.scene ? Scene.toJSON(message.scene) : undefined);
    if (message.files) {
      obj.files = message.files.map((e) =>
        e ? SceneExport_File.toJSON(e) : undefined
      );
    } else {
      obj.files = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<SceneExport>, I>>(
    object: I
  ): SceneExport {
    const message = createBaseSceneExport();
    message.scene =
      object.scene !== undefined && object.scene !== null
        ? Scene.fromPartial(object.scene)
        : undefined;
    message.files =
      object.files?.map((e) => SceneExport_File.fromPartial(e)) || [];
    return message;
  },
};

function createBaseSceneExport_File(): SceneExport_File {
  return { id: "", payload: new Uint8Array(), mediaType: "" };
}

export const SceneExport_File = {
  encode(
    message: SceneExport_File,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.payload.length !== 0) {
      writer.uint32(18).bytes(message.payload);
    }
    if (message.mediaType !== "") {
      writer.uint32(26).string(message.mediaType);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SceneExport_File {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSceneExport_File();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.payload = reader.bytes();
          break;
        case 3:
          message.mediaType = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): SceneExport_File {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      payload: isSet(object.payload)
        ? bytesFromBase64(object.payload)
        : new Uint8Array(),
      mediaType: isSet(object.mediaType) ? String(object.mediaType) : "",
    };
  },

  toJSON(message: SceneExport_File): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.payload !== undefined &&
      (obj.payload = base64FromBytes(
        message.payload !== undefined ? message.payload : new Uint8Array()
      ));
    message.mediaType !== undefined && (obj.mediaType = message.mediaType);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<SceneExport_File>, I>>(
    object: I
  ): SceneExport_File {
    const message = createBaseSceneExport_File();
    message.id = object.id ?? "";
    message.payload = object.payload ?? new Uint8Array();
    message.mediaType = object.mediaType ?? "";
    return message;
  },
};

declare var self: any | undefined;
declare var window: any | undefined;
declare var global: any | undefined;
var globalThis: any = (() => {
  if (typeof globalThis !== "undefined") return globalThis;
  if (typeof self !== "undefined") return self;
  if (typeof window !== "undefined") return window;
  if (typeof global !== "undefined") return global;
  throw "Unable to locate global object";
})();

const atob: (b64: string) => string =
  globalThis.atob ||
  ((b64) => globalThis.Buffer.from(b64, "base64").toString("binary"));
function bytesFromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; ++i) {
    arr[i] = bin.charCodeAt(i);
  }
  return arr;
}

const btoa: (bin: string) => string =
  globalThis.btoa ||
  ((bin) => globalThis.Buffer.from(bin, "binary").toString("base64"));
function base64FromBytes(arr: Uint8Array): string {
  const bin: string[] = [];
  arr.forEach((byte) => {
    bin.push(String.fromCharCode(byte));
  });
  return btoa(bin.join(""));
}

type Builtin =
  | Date
  | Function
  | Uint8Array
  | string
  | number
  | boolean
  | undefined;

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin
  ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & Record<
        Exclude<keyof I, KeysOfUnion<P>>,
        never
      >;

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isObject(value: any): boolean {
  return typeof value === "object" && value !== null;
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
