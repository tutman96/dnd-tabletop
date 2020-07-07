import React, { useState, useEffect } from "react";
import { useRouteMatch } from "react-router-dom";
import { Spinner, Text, useTheme, IconButton, IconPlay, IconRotateCcw, IconRotateCw, IconPause, IconUpload, IconEdit2, IconCheck, Input } from "sancho";
import { css } from "emotion";

import { useSceneDatabase as useSceneDatabase, IScene } from ".";
import Canvas from "./canvas";
import AddAssetButton from "./addAssetButton";
import { useSettingsDatabase, Settings } from "../settings";

const { useOneValue } = useSceneDatabase();
const { useOneValue: useOneSettingValue } = useSettingsDatabase();

function SceneNameHeader({ name, onUpdate: updateName }: { name: string, onUpdate: (name: string) => void }) {
	const theme = useTheme();
	const [inEdit, setInEdit] = useState(false);
	const [localName, setLocalName] = useState(name);

	useEffect(() => {
		setLocalName(name);
	}, [name]);

	return (
		<div
			className={css`
				display: flex;
				align-items: center;
			`}
		>
			{!inEdit &&
				<>
					<Text variant="lead">{name}</Text>
					<IconButton icon={<IconEdit2 />} size="sm" variant="ghost" label="Edit Name" onClick={() => setInEdit(true)} />
				</>
			}
			{inEdit &&
				<>
					<Input value={localName} onChange={(e) => setLocalName(e.target.value)} />
					<IconButton
						icon={<IconCheck />}
						size="sm"
						variant="ghost"
						color={theme.colors.intent.success.base}
						label="Save Name"
						onClick={() => {
							updateName(localName);
							setInEdit(false);
						}}
						disabled={!localName.trim()}
					/>
				</>
			}
		</div >
	);
}

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

	if (!match.params.id) {
		return null;
	}

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
				<SceneNameHeader name={scene.name} onUpdate={(name) => updateScene({ ...scene, name })} />
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