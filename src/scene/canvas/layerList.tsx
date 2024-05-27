import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import TvOutlinedIcon from '@mui/icons-material/TvOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ArrowUpwardOutlinedIcon from '@mui/icons-material/ArrowUpwardOutlined';
import ArrowDownwardOutlinedIcon from '@mui/icons-material/ArrowDownwardOutlined';

import {ILayer} from '../layer';
import EditLayerButton from './editLayerButton';
import DeleteLayerButton from './deleteLayerButton';
import AddLayerButton from './addLayerButton';
import theme, {BACKDROP_STYLE} from '../../theme';
import * as Types from '../../protos/scene';
import {TABLEVIEW_LAYER_ID} from '../layer/tableView';

type Props = {
  layers: Array<ILayer>;
  activeLayerId: string | null;
  setActiveLayer: (layerId: string) => void;
  updateLayer: (layer: ILayer) => void;
  addLayer: (type: Types.Layer_LayerType) => void;
  editActiveLayerName: (name: string) => void; // TODO
  moveActiveLayer: (direction: 'up' | 'down') => void;
  deleteActiveLayer: () => void;
};
const LayerList: React.FunctionComponent<Props> = ({
  layers,
  activeLayerId,
  setActiveLayer,
  addLayer,
  updateLayer,
  moveActiveLayer,
  deleteActiveLayer,
}) => {
  const layerIndex = layers.findIndex(l => l.id === activeLayerId);
  const isActiveLayerTop = layerIndex === layers.length - 1;
  const isActiveLayerBottom = layerIndex === 0;
  const activeLayer = layers.find(l => l.id === activeLayerId);

  return (
    <Card
      sx={{
        width: theme.spacing(38),
        position: 'absolute',
        ...BACKDROP_STYLE,
        right: theme.spacing(2),
        bottom: theme.spacing(2),
      }}
    >
      <List dense={true}>
        <ListItemButton
          selected={activeLayerId === TABLEVIEW_LAYER_ID}
          onClick={() => setActiveLayer(TABLEVIEW_LAYER_ID)}
        >
          <ListItemIcon>
            <IconButton size="small" disabled>
              <TvOutlinedIcon />
            </IconButton>
          </ListItemIcon>
          <ListItemText primary="TV/Table View" secondary=" " />
        </ListItemButton>

        {Array.from(layers)
          .reverse()
          .map(layer => (
            <ListItem
              key={layer.id}
              disablePadding
              secondaryAction={
                <Typography
                  color={theme.palette.text.disabled}
                  variant="overline"
                >
                  {Types.Layer_LayerType[layer.type]}
                </Typography>
              }
            >
              <ListItemButton
                selected={activeLayer === layer}
                onClick={() => setActiveLayer(layer.id)}
              >
                <ListItemIcon>
                  <IconButton
                    size="small"
                    onClick={e => {
                      layer.visible = !layer.visible;
                      updateLayer(layer);
                      e.stopPropagation(); // to prevent the layer from becoming active
                    }}
                    disableRipple
                  >
                    {layer.visible ? (
                      <VisibilityOutlinedIcon />
                    ) : (
                      <VisibilityOffOutlinedIcon />
                    )}
                  </IconButton>
                </ListItemIcon>
                <ListItemText primary={layer.name} />
              </ListItemButton>
            </ListItem>
          ))}
      </List>
      <CardActions sx={{display: 'flex', justifyContent: 'space-between'}}>
        {/* Delete Layer */}
        <DeleteLayerButton layer={activeLayer} onDelete={deleteActiveLayer} />

        <Box>
          {/* Move Layer Up */}
          <IconButton
            disabled={
              activeLayerId === null ||
              activeLayerId === TABLEVIEW_LAYER_ID ||
              isActiveLayerTop
            }
            onClick={() => moveActiveLayer('up')}
            size="small"
          >
            <Tooltip title="Layer Up">
              <ArrowUpwardOutlinedIcon />
            </Tooltip>
          </IconButton>

          {/* Move Layer Down */}
          <IconButton
            disabled={
              activeLayerId === null ||
              activeLayerId === TABLEVIEW_LAYER_ID ||
              isActiveLayerBottom
            }
            onClick={() => moveActiveLayer('down')}
            size="small"
          >
            <Tooltip title="Layer Down">
              <ArrowDownwardOutlinedIcon />
            </Tooltip>
          </IconButton>

          {/* Edit Layer Name */}
          <EditLayerButton layer={activeLayer} onUpdate={updateLayer} />
        </Box>

        <AddLayerButton onAdd={addLayer} />
      </CardActions>
    </Card>
  );
};
export default LayerList;
