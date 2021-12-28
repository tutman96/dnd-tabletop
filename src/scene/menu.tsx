import React, { useEffect, useState } from 'react';
import { useLocation, useMatch, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Modal from '@mui/material/Modal'
import Link from '@mui/material/Link'

import theme from '../theme';
import { IScene } from '.';
import SceneList from './list';
import FloatingIcon from '../partials/floatingIcon';
import SettingsPanel from '../settings';

enum TabOptions {
	SCENES,
	DISPLAYS,
	SETTINGS
}

function useCurrentSelectedSceneId() {
	const routeMatch = useMatch('/scenes/:id');
	return routeMatch?.params.id;
}

type Props = {};
const Menu: React.FunctionComponent<Props> = () => {
	const [menuOpen, setMenuOpen] = useState<boolean>(false);
	const [selectedTab, setSelectedTab] = useState(TabOptions.SCENES);
	const location = useLocation();
	const navigate = useNavigate();

	const currentSelectedSceneId = useCurrentSelectedSceneId();

	function onSceneSelect(scene: IScene) {
		navigate(`/scenes/${scene.id}`)
	}

	useEffect(() => {
		setMenuOpen(false);
		setSelectedTab(TabOptions.SCENES);
	}, [location])

	return (
		<>
			<FloatingIcon onClick={() => setMenuOpen(!menuOpen)} active={menuOpen} />
			<Modal open={menuOpen} onClose={() => setMenuOpen(false)}>
				<Card sx={{
					position: 'absolute',
					top: 0, left: 0,
					margin: theme.spacing(1),
					width: '100%', maxWidth: theme.spacing(64)
				}}
					elevation={5}
				>
					<Box sx={{
						borderBottom: 1, borderColor: 'divider',
						display: 'flex', justifyContent: 'space-between'
					}}>
						<Tabs sx={{ marginLeft: theme.spacing(6) }} value={selectedTab} onChange={(e, v) => setSelectedTab(v)}>
							<Tab label="Scenes" value={TabOptions.SCENES} />
							<Tab label="Displays" value={TabOptions.DISPLAYS} />
							<Tab label="Settings" value={TabOptions.SETTINGS} />
						</Tabs>
					</Box>
					<CardContent>
						<Box sx={{ display: selectedTab === TabOptions.SCENES ? 'block' : 'none' }}>
							<SceneList onSceneSelect={onSceneSelect} selectedSceneId={currentSelectedSceneId} />
						</Box>
						<Box sx={{ display: selectedTab === TabOptions.DISPLAYS ? 'block' : 'none' }}>
							<Link href="#/table" target="_blank" >Open Local Display</Link>
						</Box>
						<Box sx={{ display: selectedTab === TabOptions.SETTINGS ? 'block' : 'none' }}>
							<SettingsPanel />
						</Box>
					</CardContent>
				</Card>
			</Modal>
		</>
	)
}

export default Menu;