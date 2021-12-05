import React from "react";
import { css } from 'emotion'
import { Global } from '@emotion/core'
import { useTheme } from 'sancho';
import { Helmet } from 'react-helmet';
import { Switch, Route, useRouteMatch, useHistory } from "react-router-dom";

import SceneEditor from "../scene/editor";
import SceneList from "../scene/list";
import { IScene } from ".";

function useCurrentSelectedScene() {
  const routeMatch = useRouteMatch();
  const matchedSceneRoute = useRouteMatch<{ id: string }>({ path: routeMatch.path + '/:id' });
  return matchedSceneRoute?.params.id;
}

type Props = {};
const ScenePage: React.SFC<Props> = () => {
  const theme = useTheme();
  const history = useHistory();
  const routeMatch = useRouteMatch();

  const currentSelectedScene = useCurrentSelectedScene();

  function onSceneSelect(scene: IScene) {
    history.push(`${routeMatch.path}/${scene.id}`)
  }

  return (
    <>
      <Helmet
        title='D&amp;D Tabletop'
      />
      <Global
        styles={{
          html: {
            background: theme.colors.background.default,
            color: theme.colors.text.default,
            fontFamily: theme.fonts.base,
          },
          body: {
            padding: 0,
            margin: 0,
            width: '100vw',
            height: '100vh',
            "*:focus": {
              outline: 'none'
            },
            overflow: 'hidden'
          }
        }}
      />
      <Switch>
        <Route path={[`${routeMatch.path}`, `${routeMatch.path}/:id`]} exact>
          <div
            className={css`
              display: flex;
              flex-direction: row;
              width: 100%;
              height: 100vh;
            `}
          >
            <SceneList onSceneSelect={onSceneSelect} selectedSceneId={currentSelectedScene!} />
            <SceneEditor onSceneDelete={() => history.push(`${routeMatch.path}/`)}/>
          </div>
        </Route>
      </Switch>
    </>
  );
};
export default ScenePage;