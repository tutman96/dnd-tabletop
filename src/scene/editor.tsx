import React from "react";
import { useRouteMatch } from "react-router-dom";
import { Spinner, Text, useTheme, IconButton, IconPlay, IconRotateCcw, IconRotateCw, IconPause, IconUpload } from "sancho";
import { css } from "emotion";

import { useSceneDatabase as useSceneDatabase, IScene } from ".";
import Canvas from "./canvas";
import AddAssetButton from "./addAssetButton";
import { useSettingsDatabase, Settings } from "../settings";

const { useOneValue } = useSceneDatabase();
const { useOneValue: useOneSettingValue } = useSettingsDatabase();

function TableDisplayButton({ scene }: { scene: IScene }) {
	const theme = useTheme();
	const [displayedScene, updateDisplayedScene] = useOneSettingValue(Settings.DISPLAYED_SCENE);
	const [tableFreeze, updateTableFreeze] = useOneSettingValue(Settings.TABLE_FREEZE);

	if (displayedScene === scene.id) {
		if (tableFreeze) {
			return (
				<IconButton
					icon={<IconPlay />}
					variant="ghost"
					label="Unfreeze Table"
					color={theme.colors.palette.green.base} 
					onPress={() => updateTableFreeze(false)}
				/>
			)
		}
		else {
			return (
				<IconButton
					icon={<IconPause />}
					variant="ghost"
					label="Freeze Table"
					color={theme.colors.palette.yellow.base} 
					onPress={() => updateTableFreeze(true)}
				/>
			)
		}
	}
	else {
		return (
			<IconButton
				icon={<IconUpload />}
				variant="ghost"
				label="Display on Table"
				color={theme.colors.text.heading} onPress={() => {
					updateDisplayedScene(scene.id);
					updateTableFreeze(false)
				}}
			/>
		)
	}
}

type Props = {};
const SceneEditor: React.SFC<Props> = () => {
	const theme = useTheme();

	const match = useRouteMatch<{ id: string }>();

	const [scene, updateScene] = useOneValue(match.params.id);

	if (!scene) {
		return <Spinner label="Loading scene..." center />
	}

	return (
		<div
			className={css`
				display: flex;
				flex-direction: column;
				height: 100%;
				width: 100%;
				flex-grow: 1;
			`}
		>
			{/* Header */}
			<div
				className={css`
					background-color: ${theme.colors.background.layer};
					padding: ${theme.spaces.sm} ${theme.spaces.md};
					box-shadow: ${theme.shadows.sm};
					width: 100%;
					box-sizing: border-box;
					height: 56px;
					display: flex;
					align-items: center;
					justify-content: space-between;
				`}
			>
				<Text variant="lead">{scene.name}</Text>
				<div>
					<IconButton icon={<IconRotateCcw />} variant="ghost" label="Undo" />
					<AddAssetButton scene={scene} onUpdate={updateScene} />
					<IconButton icon={<IconRotateCw />} variant="ghost" label="Redo" />
				</div>
				<div>
					<TableDisplayButton scene={scene} />
				</div>
			</div>

			<Canvas scene={scene} onUpdate={updateScene} />
		</div>
	);
}
export default SceneEditor;