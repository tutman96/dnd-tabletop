import React from "react";
import ScenePage from "./scene/page";
import TablePage from "./table/page";
import { IconFilm, IconMap } from "sancho";
import { SIDEBAR_WIDTH } from "./sidebar";

export interface IRoute {
	name: string;
	path: string;
	sidebarIcon: React.ComponentType<any>,
	main: React.ComponentType<any>;
	popout?: boolean;
	exact?: boolean;
}

const routes = {
	home: {
		name: 'Home',
		path: '/',
		sidebarIcon: () => <img width={SIDEBAR_WIDTH / 1.5} height={SIDEBAR_WIDTH / 1.5} src="/favicon.png" alt="home icon" />,
		main: () => <></>,
		exact: true,
	},
	scenes: {
		name: 'Scenes',
		path: '/scenes',
		sidebarIcon: IconFilm,
		main: () => <ScenePage />,
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