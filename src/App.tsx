import React from 'react';
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Redirect
} from 'react-router-dom';

import Main from './main';
import { DarkMode } from 'sancho';
import Table from './table';

type Props = {};
const App: React.SFC<Props> = () => {
	return (
		<DarkMode>
			<Router>
				<Switch>
					<Route path="/scenes">
						<Main />
					</Route>
					<Route path="/table">
						<Table />
					</Route>
					<Redirect to="/scenes" />
				</Switch>
			</Router>
		</DarkMode>
	);
}
export default App;