import React, { useState, useEffect } from 'react';
import { IPolygon, PolygonType } from "../editablePolygon";
import { Vector2d } from 'konva/types/types';
import { Shape, Line } from 'react-konva';
import { useTheme } from 'sancho';
import { getVisibilityPolygon } from './rayCastingUtils';
import { useCurrentScene } from '../../canvas';
import { useTableResolution, useTablePPI } from '../../../settings';
import { LineConfig } from 'konva/types/shapes/Line';

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

const VisibilityPolygon: React.SFC<{ position: Vector2d, obstructionPolygons: Array<IPolygon> } & Partial<LineConfig>> = ({ position, obstructionPolygons, ...lineOptions }) => {
  const screenPolygon = useScreenPolygon();

  const obstructionWithScreen = [...obstructionPolygons.filter((p) => p.visibleOnTable), screenPolygon];
  const visibilityPolygon = getVisibilityPolygon(position, obstructionWithScreen);

  const visibilityLinePoints = visibilityPolygon.verticies
    .map((v) => [v.x, v.y]).flat();

  return (
    <Line
      {...lineOptions}
      points={visibilityLinePoints}
      listening={false}
    />
  )
}

const fillGradientColorStops = [0, 'rgba(255,255,255,0.90)', 0.10, 'rgba(255,255,255,0.70)', 0.40, 'rgba(255,255,255,0.40)', 0.60, 'rgba(255,255,255,0.10)', 1, 'transparent'];

type Props = {
  light: ILightSource,
  displayIcon: boolean,
  obstructionPolygons: Array<IPolygon>,
  onUpdate: (light: ILightSource) => void,
  isTable: boolean,
  selected: boolean,
  onSelected: () => void,
};
const RayCastRevealPolygon: React.SFC<Props> = ({ light, displayIcon, obstructionPolygons, onUpdate, isTable, selected, onSelected }) => {
  const theme = useTheme();
  const ppi = useTablePPI() || 86;

  const [localPosition, setLocalPosition] = useState(light.position);

  useEffect(() => {
    setLocalPosition(light.position);
  }, [light.position, setLocalPosition])


  return (
    <>
      <VisibilityPolygon
        position={localPosition}
        obstructionPolygons={obstructionPolygons}

        closed={true}
        fillRadialGradientStartPoint={localPosition}
        fillRadialGradientEndPoint={localPosition}
        fillRadialGradientStartRadius={0}
        fillRadialGradientEndRadius={ppi * (40 / 5)} // TODO: make configurable
        fillRadialGradientColorStops={fillGradientColorStops}
        opacity={isTable ? 1 : 0.5}
        globalCompositeOperation="destination-out"
      />
      {displayIcon && (
        <Shape
          x={light.position.x}
          y={light.position.y}
          draggable={selected}
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
            light.position = { x: e.target.x(), y: e.target.y() };
            onUpdate(light);
          }}
          onClick={(e) => {
            if (e.evt.button === 0) {
              e.cancelBubble = true;
              onSelected();
            }
          }}
          fill={theme.colors.palette.violet.lightest}
          strokeEnabled={selected}
          stroke={selected ? theme.colors.palette.blue.base : undefined}
          strokeWidth={5}
          strokeScaleEnabled={false}
          dash={[2, 2]}
        />
      )}
    </>
  );
}
export default RayCastRevealPolygon;