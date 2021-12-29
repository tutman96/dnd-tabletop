import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
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
			<Router>
				<Routes />
			</Router>
		</ThemeProvider>
	);
}
export default App;