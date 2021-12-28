import React, { useState, useRef, useEffect } from 'react';
import { IPolygon, PolygonType } from "../editablePolygon";
import { Shape, Line } from 'react-konva';
import { useTheme } from 'sancho';
import { getVisibilityPolygon } from './rayCastingUtils';
import { useTablePPI } from '../../../settings';
import Konva from 'konva';

export interface ILightSource {
  position: Konva.Vector2d,
  brightLightDistance?: number,
  dimLightDistance?: number,
}

export function defaultLightSource(light: ILightSource) {
  // torch light
  light.brightLightDistance = light.brightLightDistance === undefined ? 4 : light.brightLightDistance;
  light.dimLightDistance = light.dimLightDistance === undefined ? 8 : light.dimLightDistance;
  return light;
}

function useFogBoundsPolygon(lightSource: Konva.Vector2d, fogPolygons: Array<IPolygon>): IPolygon {
  let minX: number = lightSource.x;
  let maxX: number = lightSource.x;
  let minY: number = lightSource.y;
  let maxY: number = lightSource.y;

  fogPolygons.forEach(poly => {
    poly.verticies.forEach(v => {
      minX = Math.min(minX, v.x);
      maxX = Math.max(maxX, v.x);
      minY = Math.min(minY, v.y);
      maxY = Math.max(maxY, v.y);
    })
  })

  // Expand Bounds Around Light to make
  // sure there's no weird issue with the light
  // being on top of a vertex.
  minX -= 10;
  minY -= 10;
  maxX += 10;
  maxY += 10;

  return {
    type: PolygonType.LIGHT_OBSTRUCTION,
    verticies: [
      { x: minX, y: minY }, // top left
      { x: maxX, y: minY }, // top right
      { x: maxX, y: maxY }, // bottom right
      { x: minX, y: maxY }, // bottom left
      { x: minX, y: minY }, // top left (close the poly)
    ],
    visibleOnTable: true
  };
}

// const fillGradientColorStops = [0, 'rgba(255,255,255,0.90)', 0.10, 'rgba(255,255,255,0.70)', 0.40, 'rgba(255,255,255,0.40)', 0.60, 'rgba(255,255,255,0.10)', 1, 'transparent'];

type Props = {
  light: ILightSource,
  displayIcon: boolean,
  obstructionPolygons: Array<IPolygon>,
  fogPolygons: Array<IPolygon>
  onUpdate: (light: ILightSource) => void,
  isTable: boolean,
  selected: boolean,
  onSelected: () => void
};
const RayCastRevealPolygon: React.SFC<Props> = ({ light, displayIcon, fogPolygons, obstructionPolygons, onUpdate, selected, onSelected }) => {
  const theme = useTheme();
  const ppi = useTablePPI() || 86;
  const iconRef = useRef<Konva.Shape>();

  const [localPosition, setLocalPosition] = useState(light.position);

  useEffect(() => {
    setLocalPosition(light.position);
  }, [light.position, setLocalPosition])

  let fogPolygon = useFogBoundsPolygon(localPosition, fogPolygons);
  const defaultedLight = defaultLightSource(light);

  const obstructionWithFogPoly = [...obstructionPolygons.filter((p) => p.visibleOnTable), fogPolygon];
  const visibilityPolygon = getVisibilityPolygon(localPosition, obstructionWithFogPoly);

  const visibilityLinePoints = visibilityPolygon.verticies
    .map((v) => [v.x, v.y]).flat();

  if (iconRef.current) {
    iconRef.current.setZIndex(9999);
  }

  let dimlightBrightLightRatio = Math.max(0, Math.min(1, defaultedLight.brightLightDistance! / defaultedLight.dimLightDistance!));
  if (isNaN(dimlightBrightLightRatio)) {
    dimlightBrightLightRatio = 0;
  }

  return (
    <>
      <Line
        name={"Polygon"}
        points={visibilityLinePoints}
        listening={false}

        closed={true}
        fillRadialGradientStartPoint={localPosition}
        fillRadialGradientEndPoint={localPosition}
        fillRadialGradientStartRadius={0}
        fillRadialGradientEndRadius={ppi * Math.max(defaultedLight.brightLightDistance!, defaultedLight.dimLightDistance!)}
        fillRadialGradientColorStops={[
          0, 'rgba(255,255,255,1)',
          dimlightBrightLightRatio, 'rgba(255,255,255,0.30)',
          1, 'rgba(255,255,255,0)'
        ]}
        globalCompositeOperation="destination-out"
      />
      {displayIcon && (
        <Shape
          name={"Icon"}
          x={light.position.x}
          y={light.position.y}
          ref={iconRef as any}
          onMouseDown={(e) => {
            if (e.evt.button === 0 && selected) {
              iconRef.current?.startDrag(e)
              e.cancelBubble = true;
            }
          }}
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