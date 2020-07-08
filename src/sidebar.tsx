import React from 'react';
import { useRouteMatch, Link, useLocation } from 'react-router-dom';
import { css } from "emotion";
import { useTheme, IconButton, Tooltip } from 'sancho';

import routes, { IRoute } from './routes';
import SettingsSidebarItem from './settings';

export const SIDEBAR_WIDTH = 48;

type Props = { route: IRoute }
const SidebarItem: React.SFC<Props> = ({ route }) => {
	const theme = useTheme();
	const match = !!useRouteMatch({
		path: route.path,
		exact: route.exact
	});

	return (
		<Link to={route.path} target={route.popout ? '_blank' : undefined}>
			<Tooltip content={route.name} placement="right">
				<IconButton variant="ghost" color={match ? theme.colors.text.default : theme.colors.text.muted} size="lg" icon={<route.sidebarIcon />} label={route.name} />
			</Tooltip>
		</Link>
	)
}

const Sidebar: React.SFC = () => {
	const theme = useTheme();
	const location = useLocation();

	const hideSidebar = Object.keys(routes)
		.map((routeName) => routes[routeName])
		.some((route) => route.exact && route.popout && route.path === location.pathname) || location.pathname === routes.home.path;

	if (hideSidebar) {
		return null;
	}

	return (
		<div
			className={css`
				width: ${SIDEBAR_WIDTH}px;
				height: 100vh;
				display: flex;
				flex-direction: column;
				background-color: ${theme.colors.background.tint2};
			`}
		>
			{Object.keys(routes).map(routeName => {
				const route = routes[routeName as keyof typeof routes];
				return <SidebarItem key={routeName} route={route} />
			})}
			<div className={css`flex-grow: 1;`}/>
			<SettingsSidebarItem />
		</div>
	)
}
export default Sidebar;