import React, { useCallback } from "react";
import ScenePage from "./scene/page";
import TablePage from "./table/page";
import { IconFilm, IconMap } from "sancho";
import { Redirect } from "react-router-dom";
import { SIDEBAR_WIDTH, useSceneSidebarOpen } from "./theme";

export interface IRoute {
	name: string;
	path: string;
	sidebarIcon: React.ComponentType<any>,
	main: React.ComponentType<any>;
	popout?: boolean;
	exact?: boolean;
	useOnClick?: () => () => void;
}

const routes = {
	home: {
		name: 'Home',
		path: '/',
		sidebarIcon: () => <img width={SIDEBAR_WIDTH / 1.5} height={SIDEBAR_WIDTH / 1.5} src="favicon.png" alt="home icon" />,
		main: () => <Redirect to={routes.scenes.path} />,
		exact: true,
	},
	scenes: {
		name: 'Scenes',
		path: '/scenes',
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
		name: 'Table View',
		path: '/table',
		sidebarIcon: IconMap,
		main: () => <TablePage />,
		popout: true,
		exact: true,
	}
} as { [key: string]: IRoute }

export default routes;