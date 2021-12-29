import React from "react";

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

import { IScene } from "..";
import { ILayer } from "../layer";
import LayerType from "../layer/layerType";
import { TableViewLayer } from "../layer/tableView";
import EditLayerButton from "./editLayerButton";
import DeleteLayerButton from "./deleteLayerButton";
import AddLayerButton from "./addLayerButton";
import theme from "../../theme";

type Props = {
	scene: IScene,
	activeLayerId: string | null,
	setActiveLayer: (layer: string) => void,
	updateLayer: (layer: ILayer) => void,
	addLayer: (type: LayerType) => void,
	editActiveLayerName: (name: string) => void, // TODO
	moveActiveLayer: (direction: "up" | "down") => void;
	deleteActiveLayer: () => void
};
const LayerList: React.SFC<Props> = ({ scene, activeLayerId, setActiveLayer, addLayer, updateLayer, moveActiveLayer, deleteActiveLayer }) => {
	const layerIndex = scene.layers.findIndex((l) => l.id === activeLayerId);
	const isActiveLayerTop = layerIndex === scene.layers.length - 1;
	const isActiveLayerBottom = layerIndex === 0;
	const activeLayer = scene.layers.find((l) => l.id === activeLayerId);

	return (
		<Card sx={{
			width: theme.spacing(38),
			position: 'absolute',
			right: theme.spacing(2), bottom: theme.spacing(2),
		}}	>
			<List dense={true}>
				<ListItemButton
					selected={activeLayerId === TableViewLayer.id}
					onClick={() => setActiveLayer(TableViewLayer.id)}
				>
					<ListItemIcon><IconButton size="small" disabled><TvOutlinedIcon /></IconButton></ListItemIcon>
					<ListItemText primary={TableViewLayer.name} secondary=" " />
				</ListItemButton>

				{Array.from(scene.layers).reverse().map((layer) => (
					<ListItem
						key={layer.id}
						disablePadding
						secondaryAction={<Typography color={theme.palette.text.disabled} variant="overline">{LayerType[layer.type]}</Typography>}
					>
						<ListItemButton
							selected={activeLayer === layer}
							onClick={() => setActiveLayer(layer.id)}
						>
							<ListItemIcon>
								<IconButton
									size="small"
									onClick={(e) => {
										updateLayer({ ...layer, visible: !layer.visible })
										e.stopPropagation() // to prevent the layer from becoming active
									}}
									disableRipple
								>
									{layer.visible ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
								</IconButton>
							</ListItemIcon>
							<ListItemText primary={layer.name} />
						</ListItemButton>
					</ListItem>
				))}
			</List>
			<CardActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
				{/* Delete Layer */}
				<DeleteLayerButton
					layer={activeLayer}
					onDelete={deleteActiveLayer}
				/>

				<Box>
					{/* Move Layer Up */}
					<IconButton
						disabled={activeLayerId === null || activeLayerId === TableViewLayer.id || isActiveLayerTop}
						onClick={() => moveActiveLayer('up')}
						size="small"
					>
						<Tooltip title="Layer Up">
							<ArrowUpwardOutlinedIcon />
						</Tooltip>
					</IconButton>


					{/* Move Layer Down */}
					<IconButton
						disabled={activeLayerId === null || activeLayerId === TableViewLayer.id || isActiveLayerBottom}
						onClick={() => moveActiveLayer('down')}
						size="small"
					>
						<Tooltip title="Layer Down">
							<ArrowDownwardOutlinedIcon />
						</Tooltip>
					</IconButton>

					{/* Edit Layer Name */}
					<EditLayerButton
						layer={activeLayer}
						onUpdate={updateLayer}
					/>
				</Box>

				<AddLayerButton onAdd={(type) => addLayer(type)} />
			</CardActions>
		</Card>
	);
}
export default LayerList;