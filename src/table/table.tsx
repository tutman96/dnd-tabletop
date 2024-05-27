import React, {useState, useEffect} from 'react';

import {
  settingsDatabase,
  Settings,
  useTableResolution,
  useTableSize,
  usePlayAudioOnTable,
} from '../settings';
import {sceneDatabase} from '../scene';
import * as Types from '../protos/scene';
import TableCanvas from './canvas';

const {useOneValue} = sceneDatabase();
const {useOneValue: useOneSettingValue} = settingsDatabase();

type Props = {};
const TablePage: React.FunctionComponent<Props> = () => {
  const [displayedScene] = useOneSettingValue(Settings.DISPLAYED_SCENE);
  const [tableFreeze] = useOneSettingValue(Settings.TABLE_FREEZE);
  const [tableResolution] = useTableResolution();
  const [playAudioOnTable] = usePlayAudioOnTable();

  const [scene] = useOneValue(displayedScene as string);
  const [tableScene, setTableScene] = useState<Types.Scene | null>(null);

  const [tableSize] = useTableSize();

  useEffect(() => {
    if (scene === null || displayedScene === null) {
      setTableScene(null);
    } else if (!tableFreeze && scene !== undefined) {
      if (scene === null) setTableScene(null);
      else if (scene.version !== tableScene?.version) {
        setTableScene(scene);
      }
    }
  }, [displayedScene, scene, tableScene, tableFreeze]);

  if (!tableResolution || !tableSize) {
    return null;
  }

  return (
    <TableCanvas
      tableConfiguration={{
        resolution: tableResolution,
        size: tableSize,
        playAudioOnTable: playAudioOnTable ?? false,
      }}
      tableScene={tableScene}
    />
  );
};
export default TablePage;
