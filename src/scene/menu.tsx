import React from 'react';
import { useMatch, Link, useLocation } from 'react-router-dom';
import { css } from "emotion";
import { useTheme, IconButton, Tooltip } from 'sancho';

import routes, { IRoute } from '../routes';
import SettingsSidebarItem from '../settings';
import { useExtendedTheme } from '../theme';
import { IScene } from '.';
import SceneList from './list';

type ItemProps = { route: IRoute }
const SidebarItem: React.FunctionComponent<ItemProps> = ({ route }) => {
	const theme = useTheme();
	const match = !!useMatch({
		path: route.path
	});
	const onClick = route.useOnClick ? route.useOnClick() : undefined;

	const inner = (
		<Tooltip content={route.name} placement="right">
			<IconButton variant="ghost" color={match ? theme.colors.text.default : theme.colors.text.muted} size="lg" icon={<route.sidebarIcon />} label={route.name} />
		</Tooltip>
	);

	if (match) {
		return (
			<div onClick={onClick}>
				{inner}
			</div>
		);
	}

	return (
		<Link to={route.path} target={route.popout ? '_blank' : undefined}>
			{inner}
		</Link>
	)
}

type Props = { onSceneSelect: (scene: IScene) => any, selectedSceneId: string };
const Menu: React.FunctionComponent<Props> = ({ onSceneSelect, selectedSceneId }) => {
	const theme = useExtendedTheme();

	return (
		<>
			<div
				className={css`
				width: ${theme.sidebarWidth}px;
				height: 100vh;
				display: flex;
				flex-direction: column;
				background-color: ${theme.colors.background.default};
				z-index: 300;
			`}
			>
				{Object.keys(routes).map(routeName => {
					const route = routes[routeName as keyof typeof routes];
					return <SidebarItem key={routeName} route={route} />
				})}
				<div className={css`flex-grow: 1;`} />
				<SettingsSidebarItem />
			</div>
			<SceneList onSceneSelect={onSceneSelect} selectedSceneId={selectedSceneId} />
		</>
	)
}
export default Menu;