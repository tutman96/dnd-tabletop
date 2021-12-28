import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { DarkMode } from 'sancho';
import { css } from 'emotion';
import Konva from 'konva';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { theme } from './theme';
import routes from './routes';

Konva.showWarnings = false;

const App: React.FunctionComponent = () => {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<DarkMode>
				<Router>
					<div
						className={css`
						display: flex;
						width: 100%;
					`}
					>
						<Routes>
							{Object.keys(routes).map((routeName) => {
								const route = routes[routeName as keyof typeof routes];
								return (
									<Route
										key={routeName}
										path={route.path}
										element={<route.main />}
									/>
								);
							})}
						</Routes>
					</div>
				</Router>
			</DarkMode>
		</ThemeProvider>
	);
}
export default App;