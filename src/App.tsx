import React from 'react';
import {
	HashRouter as Router,
	Routes,
	Route
} from 'react-router-dom';
import { DarkMode } from 'sancho';
import { css } from 'emotion';

import routes from './routes';
import Sidebar from './sidebar';
import Konva from 'konva';

Konva.showWarnings = false;

const App: React.SFC = () => {
	return (
		<DarkMode>
			<Router>
				<div
					className={css`
						display: flex;
						width: 100%;
					`}
				>
					<Sidebar />
					<Routes>
						{Object.keys(routes).map((routeName) => {
							const route = routes[routeName as keyof typeof routes];
							return (
								<Route
									key={routeName}
									path={route.path}
									element={<route.main/>}
								/>
							);
						})}
					</Routes>
				</div>
			</Router>
		</DarkMode>
	);
}
export default App;