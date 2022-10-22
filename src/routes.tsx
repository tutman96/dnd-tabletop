import React, { useEffect } from "react";
import { Routes as ReactRouterRoutes, Route, useNavigate } from "react-router-dom";

import ScenePage from "./scene/page";
import PresentationPage from "./table/presentation";
import { createNewScene, sceneDatabase } from "./scene";
import { Settings, settingsDatabase } from "./settings";
import TablePage from './table/table';
import NetworkPage from './table/network';

const { useAllValues: useAllScenes, createItem } = sceneDatabase();
const { useOneValue: useOneSettingValue } = settingsDatabase();

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

const Routes: React.FunctionComponent = () => {
	return (
		<ReactRouterRoutes>
			<Route path="/" element={<Redirect />} />
			<Route path="/scenes/*" element={<ScenePage />} />
			<Route path="/table" element={<TablePage />} />
			<Route path="/table/presentation" element={<PresentationPage />} />
			<Route path="/table/network" element={<NetworkPage />} />
		</ReactRouterRoutes>
	)
}

export default Routes;