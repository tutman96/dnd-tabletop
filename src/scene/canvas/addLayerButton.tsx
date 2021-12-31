import React, { useState, useRef } from "react";

import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';

import { Layer_LayerType } from "../../protos/scene";

type Props = { onAdd: (type: Layer_LayerType) => void; };
const AddLayerButton: React.FunctionComponent<Props> = ({ onAdd }) => {
  const [showMenu, setShowMenu] = useState(false);
  const anchorEl = useRef<HTMLElement>();

  const addLayer = (type: Layer_LayerType) => () => {
    setShowMenu(false);
    onAdd(type);
  }

  return (
    <>
      <Tooltip title="Add Layer">
        <IconButton
          onClick={() => setShowMenu(true)}
          size="small"
          ref={anchorEl as any}
        >
          <AddOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl.current}
        open={showMenu}
        onClose={() => setShowMenu(false)}
      >
        <MenuItem onClick={addLayer(Layer_LayerType.ASSETS)}>
          <ListItemIcon><ImageOutlinedIcon /></ListItemIcon>
          <ListItemText primary="Asset Layer" />
        </MenuItem>
        <MenuItem onClick={addLayer(Layer_LayerType.FOG)}>
          <ListItemIcon><CloudOutlinedIcon /></ListItemIcon>
          <ListItemText primary="Fog Layer" />
        </MenuItem>
      </Menu>
    </>
  );
};
export default AddLayerButton;