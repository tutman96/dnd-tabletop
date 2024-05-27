import React from 'react';
import {Helmet} from 'react-helmet';

import SceneEditor from '../scene/editor';
import Menu from './menu';

type Props = {};
const ScenePage: React.FunctionComponent<Props> = () => {
  return (
    <>
      <Helmet title="D&amp;D Tabletop" />
      <Menu />
      <SceneEditor />
    </>
  );
};
export default ScenePage;
