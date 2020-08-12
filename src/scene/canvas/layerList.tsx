import React from "react";
import { useTheme, Layer, List, ListItem, IconButton, IconTrash2, Popover, MenuList, MenuItem, IconFile, IconCloudDrizzle, IconPlus, Text, IconArrowUp, IconArrowDown, IconEye, IconEyeOff, IconTv } from "sancho";
import { css } from "emotion";

import { IScene } from "..";
import { ILayer } from "../layer";
import LayerType from "../layer/layerType";
import { TableViewLayer } from "../layer/tableView";
import EditLayerButton from "./editLayerButton";

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
const LayerList: React.SFC<Props> = ({ scene, activeLayerId, setActiveLayer, updateLayer, addLayer, moveActiveLayer, deleteActiveLayer }) => {
	const layerIndex = scene.layers.findIndex((l) => l.id === activeLayerId);
	const isActiveLayerTop = layerIndex === scene.layers.length - 1;
	const isActiveLayerBottom = layerIndex === 0;
	const activeLayer = scene.layers.find((l) => l.id === activeLayerId);

	const theme = useTheme();
	return (
		<div
			className={css`
				position: absolute;
				right: ${theme.spaces.md};
				bottom: ${theme.spaces.md};
			`}
		>
			<Layer
				className={css`
					overflow: hidden;
					width: 300px;
				`}
			>
				<List
					className={css`
						max-height: 350px;
						overflow: auto;
					`}
				>
					<ListItem
						className={css`
							background-color: ${activeLayerId === TableViewLayer.id ? theme.colors.intent.primary.base : 'initial'} !important;
							padding: ${theme.spaces.sm} !important;
						`}
						contentBefore={
							<IconButton
								variant="ghost"
								label={TableViewLayer.name}
								icon={<IconTv />}
								disabled
								size="sm"
							/>
						}
						primary={TableViewLayer.name}
						contentAfter={' '}
						onClick={() => setActiveLayer(TableViewLayer.id)}
					/>

					{Array.from(scene.layers).reverse().map((layer) => (
						<ListItem
							key={layer.id}
							className={css`
								background-color: ${activeLayer === layer ? theme.colors.intent.primary.base : 'initial'} !important;
								padding: ${theme.spaces.sm} !important;
							`}
							contentBefore={
								<IconButton
									variant="ghost"
									label={layer.visible ? 'Hide Layer' : 'Show Layer'}
									onClick={(e) => {
										updateLayer({ ...layer, visible: !layer.visible })
										e.preventDefault(); // prevent passing through to the list item
									}}
									icon={layer.visible ? <IconEye /> : <IconEyeOff />}
									size="sm"
								/>
							}
							primary={layer.name}
							contentAfter={<Text variant="subtitle">{LayerType[layer.type]}</Text>}
							onClick={() => setActiveLayer(layer.id)}
						/>
					))}
				</List>
				<div
					className={css`
							display: flex;
							align-items: center;
							justify-content: space-between;
							background-color: ${theme.colors.background.tint1};
						`}
				>
					{/* Delete Layer */}
					<IconButton
						variant="ghost"
						disabled={!activeLayer || activeLayerId === TableViewLayer.id}
						color={theme.colors.intent.danger.base}
						icon={<IconTrash2 />}
						label="Delete Layer"
						onClick={deleteActiveLayer}
					/>

					<div>


						{/* Move Layer Up */}
						<IconButton
							variant="ghost"
							disabled={activeLayerId === null || activeLayerId === TableViewLayer.id || isActiveLayerTop}
							icon={<IconArrowUp />}
							label="Layer Up"
							onClick={() => moveActiveLayer('up')}
						/>


						{/* Move Layer Down */}
						<IconButton
							variant="ghost"
							disabled={activeLayerId === null || activeLayerId === TableViewLayer.id || isActiveLayerBottom}
							icon={<IconArrowDown />}
							label="Layer Down"
							onClick={() => moveActiveLayer('down')}
						/>


						<EditLayerButton
							layer={activeLayer}
							onUpdate={updateLayer}
						/>
					</div>

					{/* Add Layer Button */}
					<Popover
						placement="top-end"
						content={
							<MenuList>
								<MenuItem contentBefore={<IconFile />} onPress={() => addLayer(LayerType.ASSETS)}>Asset Layer</MenuItem>
								<MenuItem contentBefore={<IconCloudDrizzle />} onPress={() => addLayer(LayerType.FOG)}>Fog Layer (beta)</MenuItem>
							</MenuList>
						}
					>
						<IconButton variant="ghost" icon={<IconPlus />} label="Add Layer" />
					</Popover>
				</div>
			</Layer>
		</div>
	);
}
export default LayerList;