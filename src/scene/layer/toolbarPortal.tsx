import { ThemeProvider } from '@mui/system';
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { singletonHook } from 'react-singleton-hook';

import theme from '../../theme';
import Toolbar from './toolbar';

const useToolbarPortal = singletonHook([undefined, () => { }], () => useState<HTMLElement | undefined>(undefined));

const ToolbarPortal: React.FunctionComponent<React.PropsWithChildren> = ({ children }) => {
	const [portal] = useToolbarPortal()!;

	useEffect(() => {
		if (portal) {
			ReactDOM.render(<ThemeProvider theme={theme}>{children}</ThemeProvider>, portal);
		}
	}, [children, portal])

	useEffect(() => {
		if (portal) {
			return () => { ReactDOM.unmountComponentAtNode(portal) };
		}
		return () => {}
	}, [portal])

	return null;
}
export default ToolbarPortal;

export const ToolbarPortalProvider: React.FunctionComponent<React.PropsWithChildren> = ({ children }) => {
	const node = useRef<HTMLSpanElement>();
	const [, setPortal] = useToolbarPortal()!;

	useEffect(() => {
		setPortal(node.current);
	}, [node, setPortal]);

	return (
		<>
			<Toolbar>
				<span ref={node as any} />
			</Toolbar>
			{children}
		</>
	)
}