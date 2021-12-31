import React from "react";
import { useMatch, useNavigate } from "react-router-dom";

import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import UploadIcon from '@mui/icons-material/Upload';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

import { sceneDatabase } from ".";
import Canvas from "./canvas";
import { settingsDatabase, Settings } from "../settings";
import theme from "../theme";
import * as Types from '../protos/scene';

const { useOneValue } = sceneDatabase();
const { useOneValue: useOneSettingValue } = settingsDatabase();

const TableDisplayButton: React.FunctionComponent<{ scene: Types.Scene }> = ({ scene }) => {
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
	const navigate = useNavigate();
	let [scene, updateScene] = useOneValue(match!.params.id!);

	if (!match?.params.id) {
		return null;
	}

	if (scene === null) {
		navigate('/')
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
			<Box sx={{
				background: '#3f3f3f',
				position: 'absolute', top: 0, bottom: 0, right: 0, left: 0,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				zIndex: -1
			}}>
				<Typography sx={{ marginBottom: theme.spacing(2) }}>Loading scene...</Typography>
				<CircularProgress color="secondary" variant={scene ? 'determinate' : 'indeterminate'} value={50}/>
			</Box>

			{scene && (<>
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

				<Canvas scene={scene} onUpdate={updateScene} />
			</>
			)}
		</Box >
	);
}
export default SceneEditor;