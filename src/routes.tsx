import React, { useEffect } from "react";
import ScenePage from "./scene/page";
import TablePage from "./table/page";
import { IconFilm, IconMap } from "sancho";
import { SIDEBAR_WIDTH, useSceneSidebarOpen } from "./theme";
import { useNavigate } from "react-router-dom";
import { createNewScene, useSceneDatabase } from "./scene";
import { Settings, useSettingsDatabase } from "./settings";

export interface IRoute {
	name: string;
	path: string;
	sidebarIcon: React.ComponentType<any>,
	main: React.ComponentType<any>;
	popout?: boolean;
	useOnClick?: () => () => void;
}


const { useAllValues: useAllScenes, createItem } = useSceneDatabase();
const { useOneValue: useOneSettingValue } = useSettingsDatabase();
const Redirect: React.FunctionComponent = () => {
	const navigate = useNavigate()
	const [displayedScene] = useOneSettingValue<string>(Settings.DISPLAYED_SCENE);
	const allScenes = useAllScenes();

	useEffect(() => {
		if (displayedScene === undefined || allScenes === undefined) {
			return;
		}

		if (displayedScene) {
			navigate(`/scenes/${displayedScene}`);
		}
		else if (allScenes.size > 0) {
			const firstScene = Array.from(allScenes.values()).pop()!;
			navigate(`/scenes/${firstScene.id}`);
		}
		else {
			const newScene = createNewScene();
			newScene.name = 'Scene 1';
			createItem(newScene.id, newScene);
			navigate(`/scenes/${newScene.id}`);
		}
	}, [displayedScene, allScenes, navigate])

	return null;
}

const routes = {
	home: {
		name: 'Home',
		path: '/',
		sidebarIcon: () => <img width={SIDEBAR_WIDTH / 1.5} height={SIDEBAR_WIDTH / 1.5} src="favicon.png" alt="home icon" />,
		main: () => <Redirect />,
	},
	scenes: {
		name: 'Scenes',
		path: '/scenes/*',
		sidebarIcon: IconFilm,
		main: () => <ScenePage />,
		useOnClick: () => {
			const [sidebarOpen, setSidebarOpen] = useSceneSidebarOpen()
			return () => {
				setSidebarOpen(!sidebarOpen)
			}
		}
	},
	table: {
		name: 'TV/Table View',
		path: '/table',
		sidebarIcon: IconMap,
		main: () => <TablePage />,
		popout: true,
	}
} as { [key: string]: IRoute }

export default routes;