import React from 'react';
import {
	HashRouter as Router,
	Switch,
	Route
} from 'react-router-dom';

import Main from './main';
import { DarkMode } from 'sancho';
import Table from './table';

type Props = {};
const App: React.SFC<Props> = () => {
	if (!window.Electron) {
		return (
			<p>Cannot be opened in a browser</p>
		);
	}

	return (
		<DarkMode>
			<Router>
				<Switch>
					<Route path="/main">
						<Main />
					</Route>
					<Route path="/table">
						<Table />
					</Route>
				</Switch>
			</Router>
		</DarkMode>
	);
}
export default App;