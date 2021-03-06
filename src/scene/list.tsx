import React, { useState } from "react";
import { List, ListItem, Skeleton, Input, useTheme, IconButton, IconPlusCircle, Button, IconPlus, IconFilm, IconPlay, IconPause, Tooltip } from "sancho";
import { css } from "emotion";

import { IScene, useSceneDatabase, createNewScene } from ".";
import { useSettingsDatabase, Settings } from "../settings";
import { useExtendedTheme } from "../theme";

const { useAllValues, createItem } = useSceneDatabase();
const { useOneValue: useOneSettingValue } = useSettingsDatabase();

function LoadingScenes() {
  return <List><ListItem primary={<Skeleton animated />} /></List>
}

function NoScenes(props: { onAdd: () => void }) {
  const theme = useTheme();

  return (
    <div
      className={css`
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;
      `}
    >
      <div
        className={css`
        display: flex;
        flex-direction: column;
        align-items: center;
      `}
      >
        <IconFilm width="150px" height="150px" color="#BDBEBF" />
        <Button iconBefore={<IconPlus />} variant="ghost" color={theme.colors.text.muted} onClick={props.onAdd} size="xl">Add a scene</Button>
      </div>
    </div>
  )
}

function SceneStatusIcon({ scene }: { scene: IScene }) {
  const theme = useTheme();
  const [displayedScene] = useOneSettingValue(Settings.DISPLAYED_SCENE);
  const [tableFreeze] = useOneSettingValue(Settings.TABLE_FREEZE);

  if (displayedScene === scene.id) {
    if (!tableFreeze) {
      return <IconPlay color={theme.colors.palette.green.base} />;
    }
    else {
      return <IconPause color={theme.colors.palette.yellow.base} />;
    }
  }
  else {
    return null;
  }
}

type Props = { onSceneSelect: (scene: IScene) => any, selectedSceneId: string };
const SceneList: React.SFC<Props> = ({ onSceneSelect, selectedSceneId }) => {
  const theme = useExtendedTheme();

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

  if (!allScenes) {
    return <LoadingScenes />
  }

  if (allScenes.size === 0) {
    return <NoScenes onAdd={addNewScene} />
  }

  let sceneList = Array.from(allScenes.values());
  if (searchText) {
    sceneList = sceneList.filter((scene) => scene.name.toLowerCase().includes(searchText.toLowerCase()));
  }

  return (
    <List
      className={css`
        display: ${theme.sceneListWidth > 0 ? 'flex' : 'none'};
        width: ${theme.sceneListWidth}px;
        flex-shrink: 0;
        flex-direction: column;
        z-index: 300;
      `}
    >
      <div
        className={css`
          display: flex;
          padding: ${theme.spaces.sm};
        `}
      >
        <Input type="search" placeholder="Find a scene..." onChange={(e) => setSearchText(e.target.value)} value={searchText} />
        <Tooltip content="Add Scene">
          <IconButton icon={<IconPlusCircle />} label="Add Scene" variant="ghost" onClick={addNewScene} />
        </Tooltip>
      </div>
      <div
        className={css`
          overflow: auto;
        `}
      >
        {sceneList.map((scene) => (
          <ListItem
            primary={scene.name}
            key={scene.id}
            contentAfter={<SceneStatusIcon scene={scene} />}
            onPress={() => onSceneSelect(scene)}
            className={css`
              background: ${selectedSceneId === scene.id ? theme.colors.intent.primary.dark : undefined} !important;
            `}
          />
        ))}
      </div>
    </List>
  );
};
export default SceneList;