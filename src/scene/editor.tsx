import React, { } from "react";
import { useMatch } from "react-router-dom";

import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import UploadIcon from '@mui/icons-material/Upload';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

import { sceneDatabase, IScene } from ".";
import Canvas from "./canvas";
import { settingsDatabase, Settings } from "../settings";
import theme from "../theme";

const { useOneValue } = sceneDatabase();
const { useOneValue: useOneSettingValue } = settingsDatabase();

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
	const match = useMatch('/scenes/:id');
	const [scene, updateScene] = useOneValue(match!.params.id!);

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
				display: 'flex',
				flexDirection: 'column',
				height: '100vh',
				width: '100vw',
				flexGrow: 1,
				overflow: 'hidden'
			}}
		>
			{/* Header */}
			<Toolbar sx={{
				zIndex: theme.zIndex.appBar,
				backgroundColor: theme.palette.grey[900],
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between'
			}}>
				<Typography variant="h6" sx={{ marginLeft: theme.spacing(5) }}>{scene.name}</Typography>
				<Box />
				<Box><TableDisplayButton scene={scene} /></Box>
			</Toolbar>

			{/* Canvas */}
			<Canvas scene={scene} onUpdate={updateScene} />
		</Box >
	);
}
export default SceneEditor;