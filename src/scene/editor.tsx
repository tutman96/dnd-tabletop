import React, { useState, useEffect } from "react";
import { useMatch, useNavigate } from "react-router-dom";

import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import UploadIcon from '@mui/icons-material/Upload';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

import { sceneDatabase, IScene } from ".";
import Canvas from "./canvas";
import { settingsDatabase, Settings } from "../settings";
import theme from "../theme";
import ConfirmDialog from "../partials/confirmDialog";

const { useOneValue, deleteItem } = sceneDatabase();
const { useOneValue: useOneSettingValue } = settingsDatabase();

function SceneNameHeader({ name, onUpdate: updateName, onDelete }: { name: string, onUpdate: (name: string) => void, onDelete: () => void }) {
	const [inEdit, setInEdit] = useState(false);
	const [inDelete, setInDelete] = useState(false);
	const [localName, setLocalName] = useState(name);

	useEffect(() => {
		setLocalName(name);
	}, [name]);

	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center'
			}}
		>
			{!inEdit &&
				<>
					<Typography variant="h6">{name}</Typography>
					<Tooltip title="Edit Name">
						<IconButton size="small" onClick={() => setInEdit(true)}><EditIcon /></IconButton>
					</Tooltip>
					<Tooltip title="Delete Scene">
						<IconButton size="small" onClick={() => setInDelete(true)}><DeleteIcon /></IconButton>
					</Tooltip>
				</>
			}
			{inEdit &&
				<>
					<Input value={localName} onChange={(e) => setLocalName(e.target.value)} />
					<Tooltip title="Save Name">
						<IconButton
							size="small"
							onClick={() => {
								updateName(localName);
								setInEdit(false);
							}}
							disabled={!localName.trim()}
						>
							<CheckIcon />
						</IconButton>
					</Tooltip>
				</>
			}
			<ConfirmDialog
				open={inDelete}
				onConfirm={() => {
					onDelete();
					setInDelete(false);
				}}
				onCancel={() => setInDelete(false)}
				description={`Are you sure you want to delete '${name}'?`}
			/>
		</Box >
	);
}

function TableDisplayButton({ scene }: { scene: IScene }) {
	const [displayedScene, updateDisplayedScene] = useOneSettingValue(Settings.DISPLAYED_SCENE);
	const [tableFreeze, updateTableFreeze] = useOneSettingValue(Settings.TABLE_FREEZE);

	const currentSceneDisplayed = displayedScene === scene.id;

	return (
		<>
			<Button
				startIcon={currentSceneDisplayed ? <VisibilityOffIcon /> : <UploadIcon />}
				variant={currentSceneDisplayed ? "contained" : "outlined"}
				color={currentSceneDisplayed ? "success" : "primary"}
				onClick={() => {
					updateDisplayedScene(!currentSceneDisplayed ? scene.id : null);
					updateTableFreeze(false);
				}}
				sx={{ marginRight: theme.spacing(1) }}
			>
				{currentSceneDisplayed ? 'Hide TV/Table View' : 'Send to Table'}
			</Button>
			<Button
				startIcon={tableFreeze ? <PlayArrowIcon /> : <PauseIcon />}
				variant="outlined"
				color="secondary"
				disabled={!currentSceneDisplayed}
				onClick={() => updateTableFreeze(!tableFreeze)}
			>
				{tableFreeze ? "Unpause Table" : "Pause Table"}
			</Button>
		</>
	);
}

type Props = {};
const SceneEditor: React.FunctionComponent<Props> = () => {
	const navigate = useNavigate();

	const match = useMatch('/scenes/:id');
	const [scene, updateScene] = useOneValue(match!.params.id!);

	function onSceneDelete() {
		navigate(`/`)
	}

	if (!match?.params.id) {
		return null;
	}

	if (scene === undefined) {
		// TODO make prettier
		return <CircularProgress />
	}

	if (scene === null) {
		return null;
	}

	return (
		<Box
			sx={{
				backgroundColor: theme.palette.grey[900],
				display: 'flex',
				flexDirection: 'column',
				height: '100vh',
				width: '100vw',
				flexGrow: 1,
			}}
		>
			{/* Header */}
			<Toolbar sx={{
				marginLeft: theme.spacing(5),
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between'
			}}>
				<SceneNameHeader
					name={scene.name}
					onUpdate={(name) => updateScene({ ...scene, name })}
					onDelete={() => deleteItem(scene.id).then(() => onSceneDelete())}
				/>
				<div>
					{/* TODO */}
					{/* <IconButton icon={<IconRotateCcw />} variant="ghost" label="Undo" />
					<IconButton icon={<IconRotateCw />} variant="ghost" label="Redo" /> */}
				</div>
				<div>
					<TableDisplayButton scene={scene} />
				</div>
			</Toolbar>

			{/* Canvas */}
			<Canvas scene={scene} onUpdate={updateScene} />
		</Box >
	);
}
export default SceneEditor;