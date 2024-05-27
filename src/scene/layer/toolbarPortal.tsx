import {ThemeProvider} from '@mui/system';
import React, {useEffect, useRef, useState} from 'react';
import {Root, createRoot} from 'react-dom/client';
import {singletonHook} from 'react-singleton-hook';

import theme from '../../theme';
import Toolbar from './toolbar';

const useToolbarPortal = singletonHook([undefined, () => {}], () =>
  useState<Root | undefined>(undefined)
);

const ToolbarPortal: React.FunctionComponent<React.PropsWithChildren> = ({
  children,
}) => {
  const [portal] = useToolbarPortal()!;

  useEffect(() => {
    if (portal) {
      portal.render(<ThemeProvider theme={theme}>{children}</ThemeProvider>);
    }
  }, [children, portal]);

  useEffect(() => {
    if (portal) {
      return () => {
        portal.unmount();
      };
    }
    return () => {};
  }, [portal]);

  return null;
};
export default ToolbarPortal;

export const ToolbarPortalProvider: React.FunctionComponent<
  React.PropsWithChildren
> = ({children}) => {
  const node = useRef<HTMLSpanElement>();
  const [root, setRoot] = useState<Root | undefined>(undefined);
  const [, setPortal] = useToolbarPortal()!;

  useEffect(() => {
    if (node.current && !root) {
      const r = createRoot(node.current);
      setRoot(r);
      setPortal(r);
    }
  }, [node, root]);

  return (
    <>
      <Toolbar>
        <span ref={node as any} />
      </Toolbar>
      {children}
    </>
  );
};
