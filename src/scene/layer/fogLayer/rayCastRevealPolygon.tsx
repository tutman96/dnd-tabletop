import React, {useState, useRef, useEffect, useMemo} from 'react';
import {Shape, Line} from 'react-konva';
import Konva from 'konva';

import {yellow} from '@mui/material/colors';

import {getVisibilityPolygon} from './rayCastingUtils';
import theme from '../../../theme';
import * as Types from '../../../protos/scene';

export function defaultLightSource(light: Partial<Types.FogLayer_LightSource>) {
  // default to torch light
  light.brightLightDistance =
    light.brightLightDistance === undefined ? 4 : light.brightLightDistance;
  light.dimLightDistance =
    light.dimLightDistance === undefined ? 8 : light.dimLightDistance;
  return light as Types.FogLayer_LightSource;
}

function calculateBoundsPolygon(
  lightSource: Konva.Vector2d,
  fogPolygons: Array<Types.FogLayer_Polygon>
): Types.FogLayer_Polygon {
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
    });
  });

  // Expand Bounds Around Light to make
  // sure there's no weird issue with the light
  // being on top of a vertex.
  minX -= 10;
  minY -= 10;
  maxX += 10;
  maxY += 10;

  return {
    type: Types.FogLayer_Polygon_PolygonType.LIGHT_OBSTRUCTION,
    verticies: [
      {x: minX, y: minY}, // top left
      {x: maxX, y: minY}, // top right
      {x: maxX, y: maxY}, // bottom right
      {x: minX, y: maxY}, // bottom left
      {x: minX, y: minY}, // top left (close the poly)
    ],
    visibleOnTable: true,
  };
}

// const fillGradientColorStops = [0, 'rgba(255,255,255,0.90)', 0.10, 'rgba(255,255,255,0.70)', 0.40, 'rgba(255,255,255,0.40)', 0.60, 'rgba(255,255,255,0.10)', 1, 'transparent'];

type Props = {
  light: Types.FogLayer_LightSource;
  displayIcon: boolean;
  obstructionPolygons: Array<Types.FogLayer_Polygon>;
  fogPolygons: Array<Types.FogLayer_Polygon>;
  onUpdate: (light: Types.FogLayer_LightSource) => void;
  isTable: boolean;
  selected: boolean;
  onSelected: () => void;
};
const RayCastRevealPolygon: React.FunctionComponent<Props> = ({
  light,
  displayIcon,
  fogPolygons,
  obstructionPolygons,
  onUpdate,
  selected,
  onSelected,
}) => {
  const iconRef = useRef<Konva.Shape>();

  const [localPosition, setLocalPosition] = useState(light.position!);

  const positionX = light.position!.x;
  const positionY = light.position!.y;
  useEffect(() => {
    setLocalPosition({x: positionX, y: positionY});
  }, [positionX, positionY]);

  const defaultedLight = defaultLightSource(light);

  const visibilityPolygon = useMemo(() => {
    const fogPolygon = calculateBoundsPolygon(localPosition, fogPolygons);
    const obstructionWithFogPoly = [
      ...obstructionPolygons.filter(p => p.visibleOnTable),
      fogPolygon,
    ];
    return getVisibilityPolygon(localPosition, obstructionWithFogPoly);
  }, [localPosition, obstructionPolygons, fogPolygons]);

  const visibilityLinePoints = visibilityPolygon.verticies
    .map(v => [v.x, v.y])
    .flat();

  if (iconRef.current) {
    iconRef.current.setZIndex(9999);
  }

  let dimlightBrightLightRatio = Math.max(
    0,
    Math.min(
      1,
      defaultedLight.brightLightDistance! / defaultedLight.dimLightDistance!
    )
  );
  if (isNaN(dimlightBrightLightRatio)) {
    dimlightBrightLightRatio = 0;
  }

  return (
    <>
      <Line
        name={'Polygon'}
        points={visibilityLinePoints}
        listening={false}
        closed={true}
        fillRadialGradientStartPoint={localPosition}
        fillRadialGradientEndPoint={localPosition}
        fillRadialGradientStartRadius={0}
        fillRadialGradientEndRadius={Math.max(
          defaultedLight.brightLightDistance!,
          defaultedLight.dimLightDistance!
        )}
        fillRadialGradientColorStops={[
          0,
          'rgba(255,255,255,1)',
          dimlightBrightLightRatio,
          'rgba(255,255,255,0.30)',
          1,
          'rgba(255,255,255,0)',
        ]}
        globalCompositeOperation="destination-out"
      />
      {displayIcon && (
        <Shape
          name={'Icon'}
          x={light.position!.x}
          y={light.position!.y}
          ref={iconRef as any}
          onMouseDown={e => {
            if (e.evt.button === 0 && selected) {
              iconRef.current?.startDrag(e);
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
              y: e.target.y(),
            });
          }}
          onDragEnd={e => {
            light.position!.x = e.target.x();
            light.position!.y = e.target.y();
            onUpdate(light);
          }}
          onClick={e => {
            if (e.evt.button === 0) {
              e.cancelBubble = true;
              onSelected();
            }
          }}
          fill={yellow[100]}
          strokeEnabled={selected}
          stroke={selected ? theme.palette.primary.dark : undefined}
          strokeWidth={5}
          strokeScaleEnabled={false}
          dash={[2, 2]}
        />
      )}
    </>
  );
};
export default RayCastRevealPolygon;
