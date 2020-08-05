import React, { useState, useEffect } from 'react';
import { IPolygon, PolygonType } from "../editablePolygon";
import { Vector2d } from 'konva/types/types';
import { Shape, Line } from 'react-konva';
import { useTheme } from 'sancho';
import { getVisibilityPolygon } from './rayCastingUtils';
import { useCurrentScene } from '../../canvas';
import { useTableResolution, useTablePPI } from '../../../settings';

export interface ILightSource {
  position: Vector2d
}

function useScreenPolygon(): IPolygon {
  const scene = useCurrentScene();
  const [screenResolution] = useTableResolution();
  if (!screenResolution || !scene) {
    return { visibleOnTable: false, verticies: [], type: PolygonType.LIGHT_OBSTRUCTION };
  }

  const screenViewOptions = scene.table;
  const width = screenViewOptions.scale * screenResolution.width;
  const height = screenViewOptions.scale * screenResolution.height;

  return {
    type: PolygonType.LIGHT_OBSTRUCTION,
    verticies: [
      { x: screenViewOptions.offset.x, y: screenViewOptions.offset.y }, // top left
      { x: screenViewOptions.offset.x + width, y: screenViewOptions.offset.y }, // top right
      { x: screenViewOptions.offset.x + width, y: screenViewOptions.offset.y + height }, // bottom right
      { x: screenViewOptions.offset.x, y: screenViewOptions.offset.y + height }, // bottom left
      { x: screenViewOptions.offset.x, y: screenViewOptions.offset.y }, // top left (close the poly)
    ],
    visibleOnTable: true
  };
}

type Props = { light: ILightSource, displayIcon: boolean, obstructionPolygons: Array<IPolygon>, onUpdate: (light: ILightSource) => void, isTable: boolean };
const RayCastRevealPolygon: React.SFC<Props> = ({ light, displayIcon, obstructionPolygons, onUpdate, isTable }) => {
  const theme = useTheme();
  const ppi = useTablePPI();

  const [localPosition, setLocalPosition] = useState(light.position);

  useEffect(() => {
    setLocalPosition(light.position);
  }, [light.position, setLocalPosition])

  const obstructionWithScreen = [...obstructionPolygons.filter((p) => p.visibleOnTable), useScreenPolygon()];

  const visibilityPolygon = getVisibilityPolygon(localPosition, obstructionWithScreen);
  const visibilityLinePoints = visibilityPolygon.verticies
    .map((v) => [v.x, v.y]).flat();

  if (!ppi) return null;

  return (
    <>
      <Line
        closed={true}

        fillRadialGradientStartPoint={localPosition}
        fillRadialGradientEndPoint={localPosition}
        fillRadialGradientStartRadius={0}
        fillRadialGradientEndRadius={ppi * (40 / 5)} // TODO: make configurable
        fillRadialGradientColorStops={[0, 'white', 0.45, 'white', 0.55, 'rgba(255,255,255,0.5)', 1, 'transparent']}
        opacity={isTable ? 1 : 0.5}
        globalCompositeOperation="destination-out"
        points={visibilityLinePoints}
        listening={false}
      />
      {displayIcon && (
        <Shape
          x={light.position.x}
          y={light.position.y}
          draggable={true}
          sceneFunc={(context, shape) => {
            // custom scene function for rendering an "absolute" radius circle
            const absoluteScale = shape.getAbsoluteScale();
            const radius = 10 / absoluteScale.x;
            context.beginPath();
            context.ellipse(0, 0, radius, radius, 0, 0, Math.PI * 2, false);
            context.closePath();
            context.fillStrokeShape(shape);
          }}
          onDragMove={e => {
            setLocalPosition({
              x: e.target.x(),
              y: e.target.y()
            })
          }}
          onDragEnd={e => {
            onUpdate({
              ...light,
              position: { x: e.target.x(), y: e.target.y() }
            });
          }}
          fill={theme.colors.palette.yellow.lightest}
        />
      )}
    </>
  );
}
export default RayCastRevealPolygon;