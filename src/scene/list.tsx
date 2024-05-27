import React, {useRef, useState} from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

import Skeleton from '@mui/material/Skeleton';
import Input from '@mui/material/Input';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import {sceneDatabase, createNewScene, importScene} from '.';
import * as Types from '../protos/scene';

import {SceneListItem} from './listItem';

const {useAllValues, createItem} = sceneDatabase();

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

const AddButton: React.FunctionComponent<{
  onAdd: (scene: Types.Scene) => void;
}> = ({onAdd}) => {
  const anchorEl = useRef<HTMLElement>();
  const [menuOpen, setMenuOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const allScenes = useAllValues();

  function addNewScene() {
    const scene = createNewScene();
    if (allScenes) {
      scene.name = `Scene ${allScenes.size + 1}`;
    }
    createItem(scene.id, scene).then(() => {
      onAdd(scene);
    });
  }

  async function importNewScene() {
    try {
      setImporting(true);
      const scene = await importScene();
      onAdd(scene);
    } catch (e) {
      console.error('Error importing scene', e);
    } finally {
      setImporting(false);
    }
  }

  return (
    <>
      <IconButton ref={anchorEl as any} onClick={() => setMenuOpen(true)}>
        <AddCircleOutlineIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl.current}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      >
        <MenuItem onClick={addNewScene}>Blank Scene</MenuItem>
        <MenuItem onClick={importNewScene} disabled={importing}>
          {importing ? 'Importing...' : 'Import Scene'}
        </MenuItem>
      </Menu>
    </>
  );
};

type Props = {
  onSceneSelect: (scene: Types.Scene) => any;
  selectedSceneId: string;
};
const SceneList: React.FunctionComponent<Props> = ({
  onSceneSelect,
  selectedSceneId,
}) => {
  const allScenes = useAllValues();
  const [searchText, setSearchText] = useState('');

  if (allScenes === undefined) {
    return <LoadingScenes />;
  }

  let sceneList = Array.from(allScenes.values());
  if (searchText) {
    sceneList = sceneList.filter(scene =>
      scene.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }
  sceneList = sceneList.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <Box sx={{display: 'flex'}}>
        <Input
          placeholder="Find a scene..."
          onChange={e => setSearchText(e.target.value)}
          value={searchText}
          fullWidth
        />
        <AddButton onAdd={onSceneSelect} />
      </Box>
      <List sx={{marginX: -2}}>
        <Box sx={{overflow: 'auto'}}>
          {sceneList.map(scene => (
            <SceneListItem
              key={scene.id}
              scene={scene}
              selected={selectedSceneId === scene.id}
              onSelect={() => onSceneSelect(scene)}
            />
          ))}

          {!sceneList.length && (
            <ListItem sx={{justifyContent: 'center'}} disabled={true}>
              <Typography>No Scenes</Typography>
            </ListItem>
          )}
        </Box>
      </List>
    </>
  );
};
export default SceneList;
