import { Scene, AssetLayer_Asset, FogLayer_LightSource, FogLayer_Polygon_PolygonType, FogLayer_Polygon, Layer_LayerType } from '../protos/scene';
import { newStorage } from './'
import { oldStorage, OldIScene, OldIAssetLayer, OldLayerType, OldIPolygon, OldPolygonType, OldIFogLayer } from './oldStorage';
import { defaultLightSource } from "./layer/fogLayer/rayCastRevealPolygon";
import { tablePPI } from '../settings';

function scaleAsset(asset: AssetLayer_Asset, scale: number): AssetLayer_Asset {
  return {
    ...asset,
    transform: {
      x: asset.transform!.x! * scale,
      y: asset.transform!.y! * scale,
      width: asset.transform!.width! * scale,
      height: asset.transform!.height! * scale,
      rotation: asset.transform!.rotation
    }
  }
}

function scalePolygon(polygon: FogLayer_Polygon, scale: number): FogLayer_Polygon {
  return {
    type: polygon.type,
    visibleOnTable: polygon.visibleOnTable,
    verticies: polygon.verticies.map((v) => ({ x: v.x * scale, y: v.y * scale }))
  }
}

function scaleScene(scene: Scene, scale: number): Scene {
  scene.table!.offset!.x = scene.table!.offset!.x * scale;
  scene.table!.offset!.y = scene.table!.offset!.y * scale;

  for (const layer of scene.layers) {
    if (layer.assetLayer) {
      const assetLayer = layer.assetLayer;
      for (const [assetId, asset] of Object.entries(assetLayer.assets)) {
        assetLayer.assets[assetId] = scaleAsset(asset, scale);
      }
    }
    else if (layer.fogLayer) {
      layer.fogLayer.lightSources = layer.fogLayer.lightSources.map((l) => ({
        ...l, position: { x: l.position!.x * scale, y: l.position!.y * scale }
      }))
      layer.fogLayer.obstructionPolygons = layer.fogLayer.obstructionPolygons.map((p) => scalePolygon(p, scale));
      layer.fogLayer.fogPolygons = layer.fogLayer.fogPolygons.map((p) => scalePolygon(p, scale));
      layer.fogLayer.fogClearPolygons = layer.fogLayer.fogClearPolygons.map((p) => scalePolygon(p, scale));
    }
  }
  return scene;
}

export let migrated = false;
export async function migrate() {
  const newSceneIds = await newStorage.storage.keys();
  const ppi = await tablePPI();
  const scale = 1 / ppi;

  if (newSceneIds.length > 0 || migrated) {
    console.log('Not migrating as it has already been migrated');
    return;
  }

  console.warn('Migrating ' + newSceneIds.length + ' scenes and scaling down by ' + scale);

  migrated = true;
  const sceneIds = await oldStorage.storage.keys();
  for (const sceneId of sceneIds) {
    const oldScene = await oldStorage.storage.getItem(sceneId);

    const newScene = newSceneFromOldScene(oldScene);
    const scaledScene = scaleScene(newScene, scale);

    await newStorage.createItem(sceneId, Scene.encode(scaledScene).finish());
  }
}

export function newSceneFromOldScene(oldScene: OldIScene): Scene {
  function polygonConvert(newPolygon: OldIPolygon): FogLayer_Polygon {
    return {
      ...newPolygon,
      type: FogLayer_Polygon_PolygonType[OldPolygonType[newPolygon.type]]
    }
  }

  return {
    id: oldScene.id,
    name: oldScene.name,
    version: oldScene.version ?? 0,
    table: oldScene.table,
    layers: oldScene.layers.map((layer) => {
      if (layer.type === OldLayerType.ASSETS) {
        const oldLayer = layer as OldIAssetLayer;
        return {
          assetLayer: {
            id: oldLayer.id,
            name: oldLayer.name,
            type: Layer_LayerType.ASSETS,
            visible: oldLayer.visible,
            assets: Array.from(oldLayer.assets.values()).reduce((a, c) => ({ [c.id]: c, ...a }), {})
          },
          fogLayer: undefined,
          characterLayer: undefined,
        };
      }
      else if (layer.type === OldLayerType.FOG) {
        const oldLayer = layer as OldIFogLayer;
        return {
          fogLayer: {
            id: oldLayer.id,
            name: oldLayer.name,
            type: Layer_LayerType.FOG,
            visible: oldLayer.visible,
            lightSources: oldLayer.lightSources.map((l) => defaultLightSource(l) as FogLayer_LightSource),
            obstructionPolygons: oldLayer.obstructionPolygons.map(polygonConvert),
            fogPolygons: oldLayer.fogPolygons.map(polygonConvert),
            fogClearPolygons: oldLayer.fogClearPolygons.map(polygonConvert)
          },
          assetLayer: undefined,
          characterLayer: undefined,
        };
      }
      else {
        throw new Error('Unsupported layer type')
      }
    })
  }
}
