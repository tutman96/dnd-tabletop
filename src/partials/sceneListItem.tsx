import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

import { IScene, sceneDatabase } from "../scene";
import ConfirmDialog from "./confirmDialog";
import { SceneStatusIcon } from "../scene/list";
import RenameDialog from "./renameDialog";

const { deleteItem, useOneValue } = sceneDatabase();

export const SceneListItem: React.FunctionComponent<{ scene: IScene; selected: boolean; onSelect: () => void; }> = ({ scene, selected, onSelect }) => {
  const navigate = useNavigate();

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
        <ListItemButton onClick={onSelect} sx={{justifyContent: 'space-between'}}>
          <ListItemText primary={scene.name} />
          <SceneStatusIcon scene={scene} />
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

        <MenuItem onClick={() => {
          setInDelete(true);
          setMenuOpen(false);
        }}>
          <ListItemIcon><DeleteOutlineOutlinedIcon /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <RenameDialog
        open={inEdit}
        name={scene.name}
        onConfirm={(name) => {
          updateScene({ ...scene, name }).then(() => {
            setInEdit(false);
          })
        }}
        onCancel={() => setInEdit(false)}
      />

      <ConfirmDialog
        open={inDelete}
        onConfirm={() => {
          deleteItem(scene.id).then(() => {
            if (selected) {
              navigate('/')
            }
          });
        }}
        onCancel={() => setInDelete(false)}
        description={`Are you sure you want to delete '${scene.name}'?`} />
    </>
  );
};
