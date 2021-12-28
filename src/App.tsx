import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { DarkMode } from 'sancho';
import Konva from 'konva';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Routes from './routes';
import { theme } from './theme';

Konva.showWarnings = false;

const App: React.FunctionComponent = () => {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline enableColorScheme />
			<DarkMode>
				<Router>
					<Routes />
				</Router>
			</DarkMode>
		</ThemeProvider>
	);
}
export default App;