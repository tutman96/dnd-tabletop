import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

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

type Props = { onSceneSelect: (scene: IScene) => any, selectedSceneId: string };
const Menu: React.FunctionComponent<Props> = ({ onSceneSelect, selectedSceneId }) => {
	const [menuOpen, setMenuOpen] = useState<boolean>(false);
	const [selectedTab, setSelectedTab] = useState(TabOptions.SCENES);
	const location = useLocation();

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
							<SceneList onSceneSelect={onSceneSelect} selectedSceneId={selectedSceneId} />
						</Box>
						{selectedTab === TabOptions.DISPLAYS && (
							<Link href="#/table" target="_blank" >Open Local Display</Link>
						)}
						{selectedTab === TabOptions.SETTINGS && <SettingsPanel />}
					</CardContent>
				</Card>
			</Modal>
		</>
	)
}

export default Menu;