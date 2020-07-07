import React from 'react';
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Redirect
} from 'react-router-dom';

import { DarkMode } from 'sancho';
import TablePage from './table/page';
import ScenePage from './scene/page';

type Props = {};
const App: React.SFC<Props> = () => {
	return (
		<DarkMode>
			<Router>
				<Switch>
					<Route path="/scenes" component={ScenePage} />
					<Route path="/table" component={TablePage} />
					<Redirect to="/scenes" />
				</Switch>
			</Router>
		</DarkMode>
	);
}
export default App;