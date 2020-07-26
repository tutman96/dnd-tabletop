import React from 'react';
import {
	HashRouter as Router,
	Switch,
	Route,
	Redirect
} from 'react-router-dom';
import { DarkMode } from 'sancho';
import { css } from 'emotion';

import routes from './routes';
import Sidebar from './sidebar';

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
					<Switch>
						{Object.keys(routes).map((routeName) => {
							const route = routes[routeName as keyof typeof routes];
							return (
								<Route
									key={routeName}
									path={route.path}
									exact={route.exact}
									component={route.main}
								/>
							);
						})}
					</Switch>
				</div>
			</Router>
		</DarkMode>
	);
}
export default App;