import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import { green } from '@mui/material/colors';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

import { exportScene, sceneDatabase } from ".";
import { settingsDatabase, Settings } from "../settings";
import ConfirmDialog from "../partials/confirmDialog";
import RenameDialog from "../partials/renameDialog";
import * as Types from '../protos/scene';

const { deleteItem, useOneValue } = sceneDatabase();
const { useOneValue: useOneSettingValue } = settingsDatabase();

const SceneStatusIcon: React.FunctionComponent<{ scene: Types.Scene }> = ({ scene }) => {
  const [displayedScene] = useOneSettingValue(Settings.DISPLAYED_SCENE);
  const [tableFreeze] = useOneSettingValue(Settings.TABLE_FREEZE);

  if (displayedScene === scene.id) {
    if (!tableFreeze) {
      return <PlayArrowIcon sx={{ color: green[500] }} />;
    }
    else {
      return <PauseIcon />;
    }
  }
  else {
    return null;
  }
}

export const SceneListItem: React.FunctionComponent<{ scene: Types.Scene; selected: boolean; onSelect: () => void; }> = ({ scene, selected, onSelect }) => {
  const navigate = useNavigate();

  const [displayedScene, setDisplayedScene] = useOneSettingValue<string | null>(Settings.DISPLAYED_SCENE);
  const anchorEl = useRef<HTMLElement>();
  const [, updateScene] = useOneValue(scene.id);
  const [menuOpen, setMenuOpen] = useState(false);
  const [inEdit, setInEdit] = useState(false);
  const [inDelete, setInDelete] = useState(false);

  return (
    <>
      <ListItem
        secondaryAction={
          <IconButton
            ref={anchorEl as any}
            onClick={() => setMenuOpen(true)}
          >
            <MoreVertIcon />
          </IconButton>
        }
        disablePadding
        selected={selected}
      >
        <ListItemButton onClick={onSelect} sx={{ justifyContent: 'space-between' }}>
          <ListItemIcon><SceneStatusIcon scene={scene} /></ListItemIcon>
          <ListItemText primary={scene.name} />
        </ListItemButton>
      </ListItem>


      <Menu
        anchorEl={anchorEl.current}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      >
        <MenuItem onClick={() => {
          setInEdit(true);
          setMenuOpen(false);
        }}>
          <ListItemIcon><DriveFileRenameOutlineOutlinedIcon /></ListItemIcon>
          <ListItemText>Edit Name</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => exportScene(scene)}>
          <ListItemIcon><FileDownloadOutlinedIcon /></ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>

        <Divider/>

        <MenuItem onClick={() => {
          setInDelete(true);
          setMenuOpen(false);
        }}>
          <ListItemIcon><DeleteOutlinedIcon /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <RenameDialog
        open={inEdit}
        name={scene.name}
        onConfirm={(name) => {
          scene.name = name;
          updateScene(scene);
          setInEdit(false);
        }}
        onCancel={() => setInEdit(false)}
      />

      <ConfirmDialog
        open={inDelete}
        onConfirm={() => {
          deleteItem(scene.id).then(() => {
            if (displayedScene === scene.id) {
              setDisplayedScene(null);
            }
            if (selected) {
              navigate('/');
            }
          });
        }}
        onCancel={() => setInDelete(false)}
        description={`Are you sure you want to delete '${scene.name}'?`} />
    </>
  );
};
