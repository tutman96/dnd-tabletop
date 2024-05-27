import {v4} from 'uuid';
import {useCallback, useEffect, useState} from 'react';
import {TarWriter} from '@gera2ld/tarjs';

import globalStorage from '../storage';
import {createNewLayer, unflattenLayer} from './layer';
import {deleteAsset, fileStorage} from './asset';
import * as Types from '../protos/scene';
import {oldStorage} from './oldStorage';

export const newStorage = globalStorage<Uint8Array>('scene_2');
export function sceneDatabase() {
  return {
    ...newStorage,
    createItem: async (key: string, item: Types.Scene) => {
      await newStorage.createItem(key, Types.Scene.encode(item).finish());
    },
    useAllValues: () => {
      const oldValues = oldStorage.useAllValues();
      const newValues = newStorage.useAllValues();

      if (oldValues === undefined || newValues === undefined) {
        return undefined;
      }

      return new Map(
        Array.from(newValues.entries()).map(([sceneId, buf]) => [
          sceneId,
          Types.Scene.decode(buf),
        ])
      );
    },
    useOneValue: (
      key: string | null
    ): [Types.Scene | null | undefined, (newData: Types.Scene) => void] => {
      const [newValue, setNewValue] = newStorage.useOneValue(key);
      const [localValue, setLocalValue] = useState<Types.Scene>();

      useEffect(() => {
        setLocalValue(undefined);
      }, [key]);

      useEffect(() => {
        if (!newValue) return;
        const decodedNewValue = Types.Scene.decode(newValue);

        // Initial load
        if (!localValue) {
          setLocalValue(decodedNewValue);
          return;
        }

        // Storage updates
        if (
          decodedNewValue &&
          (decodedNewValue.id !== localValue.id ||
            decodedNewValue.version > localValue.version)
        ) {
          setLocalValue(decodedNewValue);
          return;
        }

        // Local updates
        if (
          decodedNewValue.id === localValue.id &&
          decodedNewValue.version < localValue.version
        ) {
          setNewValue(Types.Scene.encode(localValue).finish());
          return;
        }
      }, [localValue, newValue, setNewValue]);

      const updateScene = useCallback((scene: Types.Scene) => {
        scene.version++;
        console.log(
          'Updating scene ' + scene.name + ' to v' + scene.version,
          scene
        );
        setLocalValue({...scene}); // TODO: this deref should be unnecessary
      }, []);

      if (newValue === undefined) {
        return [undefined, updateScene];
      }

      if (newValue === null) {
        return [null, updateScene];
      }

      return [localValue, updateScene];
    },
    deleteItem: async (key: string) => {
      const scene = Types.Scene.decode(await newStorage.storage.getItem(key));
      for (const layer of scene.layers) {
        if (!layer.assetLayer) continue;

        for (const asset of Object.values(
          (layer.assetLayer as Types.AssetLayer).assets
        )) {
          await deleteAsset(asset);
        }
      }

      await newStorage.deleteItem(key);
      await oldStorage.deleteItem(key);
    },
  };
}

export function createNewScene(): Types.Scene {
  const defaultLayer = createNewLayer(Types.Layer_LayerType.ASSETS);
  defaultLayer.name = 'Layer 1';

  return {
    id: v4(),
    name: 'Untitled',
    version: 0,
    table: {
      offset: {x: 0, y: 0},
      rotation: 0,
      scale: 1,
      displayGrid: true,
    },
    layers: [unflattenLayer(defaultLayer)],
  };
}

async function sceneToSceneExport(scene: Types.Scene): Promise<Uint8Array> {
  const assetIds = new Set<string>();
  for (const layer of scene.layers) {
    if (!layer.assetLayer) continue;
    for (const assetId of Object.keys(layer.assetLayer.assets)) {
      assetIds.add(assetId);
    }
  }

  const files = new Array<Types.SceneExport_File>();

  for (const assetId of Array.from(assetIds.keys())) {
    const asset = await fileStorage.getItem(assetId);
    files.push({
      id: assetId,
      payload: new Uint8Array(await asset.arrayBuffer()),
      mediaType: asset.type,
    });
  }

  return Types.SceneExport.encode({scene, files}).finish();
}

export async function exportScene(scene: Types.Scene) {
  const exp = await sceneToSceneExport(scene);

  const blob = new Blob([exp], {type: 'application/octet-stream'});
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = scene.name + '.scene';
  link.href = objectUrl;
  link.click();
}

// Export all scenes as individual .scene files in a single tarball
export async function exportAllScenes() {
  const tar = new TarWriter();
  const sceneIds = await newStorage.storage.keys();
  for (const sceneId of sceneIds) {
    const scene = Types.Scene.decode(await newStorage.storage.getItem(sceneId));
    const exp = await sceneToSceneExport(scene);
    tar.addFile(scene.name + '.scene', exp);
  }

  const blob = await tar.write();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = 'scenes.tar';
  link.href = objectUrl;
  link.click();
}

export async function importScene() {
  const fileDialogInput = document.createElement('input');
  fileDialogInput.type = 'file';
  fileDialogInput.accept = '.scene';

  fileDialogInput.click();
  const file = await new Promise<File>((res, rej) => {
    fileDialogInput.onchange = e => {
      const files = (e!.target as HTMLInputElement).files;
      if (!files || files.length === 0) {
        return rej(new Error('Cancelled'));
      }
      res(files.item(0)!);
    };
  });

  const exportBinary = await new Promise<ArrayBuffer>((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => {
      if (fr.result) {
        res(fr.result as ArrayBuffer);
      }
    };
    fr.onerror = e => {
      rej(e);
    };
    fr.readAsArrayBuffer(file);
  });

  const exp = Types.SceneExport.decode(new Uint8Array(exportBinary));
  const scene = exp.scene!;
  scene.id = v4();

  const existingScenes = (
    await Promise.all(
      (await newStorage.storage.keys()).map(k => newStorage.storage.getItem(k))
    )
  ).map(b => Types.Scene.decode(b));

  let nameCollisions = 1;
  const originalName = scene.name;
  for (const existingScene of existingScenes) {
    if (existingScene.name === scene.name) {
      scene.name = originalName + ` (${++nameCollisions})`;
    }
  }

  const assetMap = new Map<string, string>();
  for (const layer of scene.layers) {
    if (!layer.assetLayer) continue;
    for (const assetId of Object.keys(layer.assetLayer.assets)) {
      const newAssetId = v4();
      assetMap.set(assetId, newAssetId);

      layer.assetLayer.assets[assetId].id = newAssetId;
      layer.assetLayer.assets[newAssetId] = layer.assetLayer.assets[assetId];
      delete layer.assetLayer.assets[assetId];
    }
  }

  for (const file of exp.files) {
    const newAssetId = assetMap.get(file.id)!;
    await fileStorage.setItem(newAssetId, new File([file.payload], newAssetId));
  }

  await newStorage.storage.setItem(
    scene.id,
    Types.Scene.encode(scene).finish()
  );
  return scene;
}

window['garbageCollect'] = async function () {
  const sceneIds = await newStorage.storage.keys();

  const foundAssets = new Set<string>();
  for (const sceneId of sceneIds) {
    const encodedScene = await newStorage.storage.getItem(sceneId);
    const scene = Types.Scene.decode(encodedScene);

    for (const layer of scene.layers) {
      if (!layer.assetLayer) continue;
      for (const asset of Object.values(layer.assetLayer.assets)) {
        foundAssets.add(asset.id);
      }
    }
  }

  const allAssets = new Set(await fileStorage.keys());
  console.warn('Removing ' + (allAssets.size - foundAssets.size) + ' assets');
  for (const asset of Array.from(allAssets.keys())) {
    if (foundAssets.has(asset)) continue;

    await fileStorage.removeItem(asset);
  }
};
