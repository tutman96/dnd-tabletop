import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { singletonHook } from 'react-singleton-hook';
import { DarkMode } from 'sancho';
import Toolbar from './toolbar';

const useToolbarPortal = singletonHook([undefined, () => { }], () => useState<HTMLElement | undefined>(undefined));

const ToolbarPortal: React.SFC = ({ children }) => {
	const [portal] = useToolbarPortal()!;

	useEffect(() => {
		if (portal) {
			ReactDOM.render(<DarkMode>{children}</DarkMode>, portal);
			return () => ReactDOM.unmountComponentAtNode(portal);
		}
		return () => { }
	}, [children, portal])

	return null;
}
export default ToolbarPortal;

export const ToolbarPortalProvider: React.SFC = ({ children }) => {
	const node = useRef<HTMLSpanElement>();
	const [, setPortal] = useToolbarPortal()!;

	useEffect(() => {
		console.log('set portal')
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