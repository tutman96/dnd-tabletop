import React, { useState, useEffect } from "react";
import { useRouteMatch } from "react-router-dom";
import { Spinner, Text, useTheme, IconButton, IconPlay, IconPause, IconUpload, IconEdit2, IconCheck, Input, Button, IconEyeOff } from "sancho";
import { css } from "emotion";

import { useSceneDatabase, IScene } from ".";
import Canvas from "./canvas";
import { useSettingsDatabase, Settings } from "../settings";
import { useExtendedTheme } from "../theme";

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
				z-index: 200;
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

	const currentSceneSelected = displayedScene === scene.id;

	return (
		<>
			<Button
				iconBefore={currentSceneSelected ? <IconEyeOff /> : <IconUpload />}
				intent="none"
				variant="outline"
				onPress={() => {
					updateDisplayedScene(!currentSceneSelected ? scene.id : null);
					updateTableFreeze(false);
				}}
			>
				{currentSceneSelected ? 'Table to Black' : 'Send to Table'}
			</Button>
			<span
				className={css`
					display: inline-block;
					width: 1rem;
				`}
			/>
			<Button
				iconBefore={tableFreeze ? <IconPlay /> : <IconPause />}
				variant={"outline"}
				disabled={!currentSceneSelected}
				onPress={() => updateTableFreeze(!tableFreeze)}
				className={css`
					${tableFreeze ? `
						border-color: ${theme.colors.intent.success.dark} !important;
						background: ${tableFreeze ? theme.colors.intent.success.base : 'initial'} !important;
					` : ''}
					min-width: 168px;
				`}
			>
				{tableFreeze ? "Unpause Table" : "Pause Table"}
			</Button>
		</>
	);
}

type Props = {};
const SceneEditor: React.SFC<Props> = () => {
	const theme = useExtendedTheme();

	const match = useRouteMatch<{ id: string }>();
	const [scene, updateScene] = useOneValue(match.params.id);

	const [displayedScene] = useOneSettingValue(Settings.DISPLAYED_SCENE);
	const [tableFreeze] = useOneSettingValue(Settings.TABLE_FREEZE);

	if (!match.params.id) {
		return null;
	}

	if (scene === undefined) {
		return <Spinner label="Loading scene..." center />
	}

	if (scene === null) {
		return null;
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
					height: ${theme.headerHeight}px;
					display: flex;
					align-items: center;
					justify-content: space-between;
					background-color: ${displayedScene === scene.id && !tableFreeze ? theme.colors.intent.success.dark : 'initial'};
				`}
			>
				<SceneNameHeader
					name={scene.name}
					onUpdate={(name) => updateScene({ ...scene, name })}
				/>
				<div>
					{/* TODO */}
					{/* <IconButton icon={<IconRotateCcw />} variant="ghost" label="Undo" />
					<IconButton icon={<IconRotateCw />} variant="ghost" label="Redo" /> */}
				</div>
				<div>
					<TableDisplayButton scene={scene} />
				</div>
			</div>

			{/* Canvas */}
			<Canvas scene={scene} onUpdate={updateScene} />
		</div>
	);
}
export default SceneEditor;