import React, { useRef, useEffect, useState } from 'react';
import { KonvaNodeEvents, Line, Group, Shape } from 'react-konva';
import { useTheme } from 'sancho';
import Konva from 'konva';

import { Vector2d } from 'konva/types/types';
import { KonvaEventObject } from 'konva/types/Node';
import { useKeyPress } from '../../utils';

const Anchor: React.SFC<{
  firstAnchor: boolean,
  position: Vector2d,
  onMove: (position: Vector2d, e: KonvaEventObject<DragEvent>) => void,
  onMoveEnd: () => void
}> = ({ firstAnchor, position, onMove, onMoveEnd }) => {
  const theme = useTheme();
  return (
    <Shape
      x={position.x}
      y={position.y}
      draggable={true}
      sceneFunc={(context, shape) => {
        // custom scene function for rendering an "absolute" radius circle
        const absoluteScale = shape.getAbsoluteScale();
        const radius = 7 / absoluteScale.x;
        context.beginPath();
        context.ellipse(0, 0, radius, radius, 0, 0, Math.PI * 2, false);
        context.closePath();
        context.fillStrokeShape(shape);
      }}
      onDragMove={e => {
        onMove({ x: e.target.x(), y: e.target.y() }, e);
        e.cancelBubble = true;
      }}
      onDragEnd={e => onMoveEnd()}
      stroke={theme.colors.palette.blue.base}
      strokeWidth={3}
      strokeScaleEnabled={false}
      fill={firstAnchor ? theme.colors.palette.blue.base : undefined}
    />
  )
}

export enum PolygonType {
  FOG,
  FOG_CLEAR,
  LIGHT_OBSTRUCTION
}

export interface IPolygon {
  type: PolygonType,
  verticies: Array<Vector2d>
  visibleOnTable: boolean;
}

interface Props {
  polygon: IPolygon
  onUpdate: (polygon: IPolygon) => void

  adding: boolean
  onAdded?: () => void

  selectable: boolean
  selected: boolean
  onSelected?: () => void
}
const EditablePolygon: React.SFC<Props & Omit<Konva.LineConfig, 'points'> & KonvaNodeEvents> = ({ polygon, onUpdate, adding, onAdded, selectable, selected, onSelected, ...lineProps }) => {
  const theme = useTheme();
  const groupRef = useRef<Konva.Group>();

  const [localVerticies, setLocalVerticies] = useState<Array<Vector2d>>(polygon.verticies);

  useEffect(() => {
    setLocalVerticies(polygon.verticies);
  }, [polygon.verticies])

  const groupX = localVerticies.reduce((min, v) => Math.min(min, v.x), Number.MAX_VALUE);
  const groupY = localVerticies.reduce((min, v) => Math.min(min, v.y), Number.MAX_VALUE);

  const relativeKonvaCoordinates = localVerticies
    .map((v) => [v.x - groupX, v.y - groupY])
    .flat();

  useEffect(() => {
    if (groupRef.current && adding) {
      const layer = groupRef.current.parent!;
      const stage = layer.parent! as unknown as Konva.Stage;

      stage.container().style.cursor = 'crosshair'
      const handleClick = (e: KonvaEventObject<MouseEvent>) => {
        if (e.evt.button !== 0 || !groupRef.current) return;

        // From https://konvajs.org/docs/sandbox/Relative_Pointer_Position.html
        var transform = stage.getAbsoluteTransform().copy();
        transform.invert();
        var pos = groupRef.current.getStage()!.getPointerPosition()!;
        var relPos = transform.point(pos);

        polygon.verticies = [...localVerticies, relPos];
        onUpdate(polygon);
      }

      stage.on('mouseup.konva', handleClick);
      return () => {
        stage.off('mouseup.konva', handleClick);
        stage.container().style.cursor = 'default';
      };
    }
  }, [groupRef, adding, localVerticies, onUpdate, polygon])

  const isEscapePressed = useKeyPress('Escape');
  const isEnterPressed = useKeyPress('Enter');
  const shouldEndAdd = isEnterPressed || isEscapePressed;
  useEffect(() => {
    if (adding && shouldEndAdd && onAdded) {
      onAdded();
    }
  }, [adding, shouldEndAdd, onAdded])

  return (
    <Group
      ref={groupRef as any}
      draggable={selected && !adding}
      x={groupX}
      y={groupY}
      listening={selectable}
      onClick={e => {
        if (e.evt.button === 0 && onSelected && selectable) {
          e.cancelBubble = true;
          onSelected();
        }
      }}
      onDragMove={e => {
        let newX = e.target.x();
        let newY = e.target.y();

        const offsetX = newX - groupX;
        const offsetY = newY - groupY;

        setLocalVerticies(localVerticies.map((v) => ({ x: v.x + offsetX, y: v.y + offsetY })));
      }}
      onDragEnd={() => {
        polygon.verticies = localVerticies;
        onUpdate(polygon);
      }}
    >
      <Line
        {...lineProps}
        points={relativeKonvaCoordinates}
      />
      {selected && (
        <>
          <Line
            closed={lineProps.closed}
            stroke={theme.colors.palette.blue.base}
            strokeWidth={3}
            dash={[4, 4]}
            strokeScaleEnabled={false}
            points={relativeKonvaCoordinates}
          />
          {localVerticies.map((v, i) => (
            <Anchor
              key={i}
              position={{ x: v.x - groupX, y: v.y - groupY }}
              onMove={(newPos, e) => {
                const v2 = { x: newPos.x + groupX, y: newPos.y + groupY };
                localVerticies[i] = v2;

                const groupX2 = localVerticies.reduce((min, v) => Math.min(min, v.x), Number.MAX_VALUE);
                const groupY2 = localVerticies.reduce((min, v) => Math.min(min, v.y), Number.MAX_VALUE);

                const newRelative = { x: v2.x - groupX2, y: v2.y - groupY2 };
                e.target.x(newRelative.x)
                e.target.y(newRelative.y)

                setLocalVerticies([...localVerticies])
              }}
              onMoveEnd={() => {
                polygon.verticies = localVerticies;
                onUpdate(polygon);
              }}
              firstAnchor={adding && i === 0}
            />
          ))}
        </>
      )}
    </Group>
  );
};
export default EditablePolygon;