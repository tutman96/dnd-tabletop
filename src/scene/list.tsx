import React, { useState } from "react";

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import Tooltip from '@mui/material/Tooltip'
import Skeleton from '@mui/material/Skeleton'
import Input from '@mui/material/Input'
import IconButton from '@mui/material/IconButton'
import { green } from '@mui/material/colors';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import { IScene, sceneDatabase, createNewScene } from ".";
import { settingsDatabase, Settings } from "../settings";
import { SceneListItem } from "../partials/sceneListItem";

const { useAllValues, createItem } = sceneDatabase();
const { useOneValue: useOneSettingValue } = settingsDatabase();

function LoadingScenes() {
  return (
    <>
      <Skeleton />
      <Skeleton />
      <Skeleton />
      <Skeleton />
      <Skeleton />
    </>
  );
}

export const SceneStatusIcon: React.FunctionComponent<{ scene: IScene }> = ({ scene }) => {
  const [displayedScene] = useOneSettingValue(Settings.DISPLAYED_SCENE);
  const [tableFreeze] = useOneSettingValue(Settings.TABLE_FREEZE);

  if (displayedScene === scene.id) {
    if (!tableFreeze) {
      return <ListItemIcon><PlayArrowIcon sx={{ color: green[500] }} /></ListItemIcon>;
    }
    else {
      return <ListItemIcon><PauseIcon /></ListItemIcon>;
    }
  }
  else {
    return null;
  }
}

type Props = { onSceneSelect: (scene: IScene) => any, selectedSceneId: string };
const SceneList: React.FunctionComponent<Props> = ({ onSceneSelect, selectedSceneId }) => {
  const allScenes = useAllValues();
  const [searchText, setSearchText] = useState("");

  function addNewScene() {
    const scene = createNewScene();
    if (allScenes) {
      scene.name = `Scene ${allScenes.size + 1}`;
    }
    createItem(scene.id, scene);
    onSceneSelect(scene);
  }

  if (allScenes === undefined) {
    return <LoadingScenes />
  }

  let sceneList = Array.from(allScenes.values());
  if (searchText) {
    sceneList = sceneList.filter((scene) => scene.name.toLowerCase().includes(searchText.toLowerCase()));
  }
  sceneList = sceneList.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <Input placeholder="Find a scene..." onChange={(e) => setSearchText(e.target.value)} value={searchText} fullWidth />
        <Tooltip title="Add Scene">
          <IconButton onClick={addNewScene}><AddCircleOutlineIcon /></IconButton>
        </Tooltip>
      </Box>
      <List sx={{ marginX: -2 }}>
        <Box sx={{ overflow: 'auto' }}>
          {sceneList.map((scene) => (
            <SceneListItem
              key={scene.id}
              scene={scene}
              selected={selectedSceneId === scene.id}
              onSelect={() => onSceneSelect(scene)}
            />
          ))}

          {!sceneList.length && (
            <ListItem sx={{ justifyContent: 'center' }} disabled={true}>
              <Typography>No Scenes</Typography>
            </ListItem>
          )}
        </Box >
      </List >
    </>
  );
};
export default SceneList;