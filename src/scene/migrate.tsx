import { Scene, AssetLayer_Asset, FogLayer_LightSource, FogLayer_Polygon_PolygonType, AssetLayer_Asset_AssetType, FogLayer_Polygon } from '../protos/scene';
import { IScene, newStorage, oldStorage } from './'
import LayerType from "./layer/layerType";
import { IAssetLayer } from "./layer/assetLayer";
import { IFogLayer } from "./layer/fogLayer";
import { defaultLightSource } from "./layer/fogLayer/rayCastRevealPolygon";
import { IPolygon, PolygonType } from "./layer/editablePolygon";
import { AssetType } from "./asset";
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
  console.log('scaling by ' + scale);
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

let migrating = false;
export async function migrate() {
  const newSceneIds = await newStorage.storage.keys();
  if (newSceneIds.length > 0 || migrating) {
    console.log('Not migrating as it has already been migrated');
    return;
  }
  
  const ppi = await tablePPI();  
  const scale = 1 / ppi;
  
  migrating = true;
  const sceneIds = await oldStorage.storage.keys();
  console.time('Done migrating ' + sceneIds.keys + ' scenes')
  for (const sceneId of sceneIds) {
    const oldScene = await oldStorage.storage.getItem(sceneId);

    const newScene = newSceneFromOldScene(oldScene);
    const scaledScene = scaleScene(newScene, scale);

    await newStorage.createItem(sceneId, Scene.encode(scaledScene).finish());
  }
  console.timeEnd('Done migrating ' + sceneIds.keys + ' scenes')
}

export function newSceneFromOldScene(oldScene: IScene): Scene {
  function polygonConvert(newPolygon: IPolygon): FogLayer_Polygon {
    return {
      ...newPolygon,
      type: FogLayer_Polygon_PolygonType[PolygonType[newPolygon.type]]
    }
  }

  return {
    id: oldScene.id,
    name: oldScene.name,
    version: oldScene.version ?? 0,
    table: oldScene.table,
    layers: oldScene.layers.map((layer) => {
      if (layer.type === LayerType.ASSETS) {
        const oldLayer = layer as IAssetLayer;
        return {
          assetLayer: {
            id: oldLayer.id,
            name: oldLayer.name,
            visible: oldLayer.visible,
            assets: Array.from(oldLayer.assets.values()).reduce((a, c) => ({ [c.id]: c, ...a }), {})
          },
          fogLayer: undefined
        };
      }
      else if (layer.type === LayerType.FOG) {
        const oldLayer = layer as IFogLayer;
        return {
          fogLayer: {
            id: oldLayer.id,
            name: oldLayer.name,
            visible: oldLayer.visible,
            lightSources: oldLayer.lightSources.map((l) => defaultLightSource(l) as FogLayer_LightSource),
            obstructionPolygons: oldLayer.obstructionPolygons.map(polygonConvert),
            fogPolygons: oldLayer.fogPolygons.map(polygonConvert),
            fogClearPolygons: oldLayer.fogClearPolygons.map(polygonConvert)
          },
          assetLayer: undefined
        };
      }
      else {
        throw new Error('Unsupported layer type')
      }
    })
  }
}

export function oldSceneFromNewScene(newScene: Scene): IScene {
  function polygonConvert(newPolygon: FogLayer_Polygon): IPolygon {
    return {
      ...newPolygon,
      type: PolygonType[FogLayer_Polygon_PolygonType[newPolygon.type]]
    }
  }

  return {
    id: newScene.id,
    name: newScene.name,
    version: newScene.version ?? 0,
    table: newScene.table,
    layers: newScene.layers.map((l) => {
      if (l.assetLayer) {
        return {
          ...l.assetLayer,
          type: LayerType.ASSETS,
          assets: new Map(Object.entries(l.assetLayer.assets).map(([assetId, asset]) =>
            [
              assetId,
              {
                ...asset,
                type: AssetType[AssetLayer_Asset_AssetType[asset.type]]
              }
            ]
          ))
        } as IAssetLayer;
      }
      else if (l.fogLayer) {

        return {
          ...l.fogLayer,
          obstructionPolygons: l.fogLayer.obstructionPolygons.map(polygonConvert),
          fogPolygons: l.fogLayer.fogPolygons.map(polygonConvert),
          fogClearPolygons: l.fogLayer.fogClearPolygons.map(polygonConvert),
          type: LayerType.FOG
        } as IFogLayer
      }
      else {
        throw new Error('Got a layer without it being asset or fog')
      }
    })
  } as IScene;
}