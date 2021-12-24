import React from "react";
import { Global } from '@emotion/core'
import { useTheme } from 'sancho';
import { Helmet } from 'react-helmet';
import { useMatch, useNavigate } from "react-router-dom";

import SceneEditor from "../scene/editor";
import { IScene } from ".";
import Menu from "./menu";

function useCurrentSelectedScene() {
  const routeMatch = useMatch('/scenes/:id');
  return routeMatch?.params.id;
}

type Props = {};
const ScenePage: React.SFC<Props> = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const currentSelectedScene = useCurrentSelectedScene();

  function onSceneSelect(scene: IScene) {
    navigate(`/scenes/${scene.id}`)
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
      <Menu onSceneSelect={onSceneSelect} selectedSceneId={currentSelectedScene!} />
      <SceneEditor onSceneDelete={() => navigate(`/`)} />
    </>
  );
};
export default ScenePage;