import { IScene } from "..";
import { LayerType, ILayer } from "../layer";
import { useTheme, Layer, List, ListItem, IconButton, IconTrash2, Popover, MenuList, MenuItem, IconFile, IconCloudDrizzle, IconPlus, Text, IconArrowUp, IconArrowDown, IconEye, IconEyeOff, IconTv } from "sancho";
import React from "react";
import { css } from "emotion";

type Props = {
	scene: IScene,
	activeLayer: string | null,
	setActiveLayer: (layer: string) => void,
	updateLayer: (layer: ILayer) => void,
	addLayer: (type: LayerType) => void,
	editActiveLayerName: (name: string) => void, // TODO
	moveActiveLayer: (direction: "up" | "down") => void;
	deleteActiveLayer: () => void
};
const LayerList: React.SFC<Props> = ({ scene, activeLayer, setActiveLayer, updateLayer, addLayer, moveActiveLayer, deleteActiveLayer }) => {
	const layerIndex = scene.layers.findIndex((l) => l.id === activeLayer);
	const isActiveLayerTop = layerIndex === scene.layers.length - 1;
	const isActiveLayerBottom = layerIndex === 0;

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
								background-color: ${activeLayer === 'TABLE_VIEW' ? theme.colors.intent.primary.base : 'initial'} !important;
							`}
						contentBefore={
							<IconButton
								variant="ghost"
								label={'Table View'}
								icon={<IconTv />}
								disabled
							/>
						}
						primary={'Table View'}
						contentAfter={' '}
						onClick={() => setActiveLayer('TABLE_VIEW')}
					/>

					{Array.from(scene.layers).reverse().map((layer) => (
						<ListItem
							key={layer.id}
							className={css`
								background-color: ${activeLayer === layer.id ? theme.colors.intent.primary.base : 'initial'} !important;
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
						disabled={activeLayer === null}
						color={theme.colors.intent.danger.base}
						icon={<IconTrash2 />}
						label="Delete Layer"
						onClick={deleteActiveLayer}
					/>

					{/* Move Layer */}
					<div>
						<IconButton
							variant="ghost"
							disabled={activeLayer === null || isActiveLayerTop}
							icon={<IconArrowUp />}
							label="Layer Up"
							onClick={() => moveActiveLayer('up')}
						/>
						<IconButton
							variant="ghost"
							disabled={activeLayer === null || isActiveLayerBottom}
							icon={<IconArrowDown />}
							label="Layer Down"
							onClick={() => moveActiveLayer('down')}
						/>
					</div>

					{/* Add Layer Button */}
					<Popover
						placement="top-end"
						content={
							<MenuList>
								<MenuItem contentBefore={<IconFile />} onPress={() => addLayer(LayerType.ASSETS)}>Asset Layer</MenuItem>
								<MenuItem contentBefore={<IconCloudDrizzle />} onPress={() => addLayer(LayerType.FOG)} disabled={true}>Fog Layer</MenuItem>
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