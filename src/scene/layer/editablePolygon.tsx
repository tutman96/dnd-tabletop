import React, { useRef, useEffect, useState } from 'react';
import { KonvaNodeEvents, Line, Group, Shape } from 'react-konva';
import { useTheme } from 'sancho';
import Konva from 'konva';

import { Vector2d } from 'konva/types/types';
import { KonvaEventObject } from 'konva/types/Node';
import { useKeyPress } from '../../utils';

const ANCHOR_RADIUS = 7;
const Anchor: React.SFC<{
  firstAnchor: boolean,
  position: Vector2d,
  onClick: () => void,
  onMove: (position: Vector2d, e: KonvaEventObject<DragEvent>) => void,
  onMoveEnd: () => void
}> = ({ firstAnchor, position, onClick, onMove, onMoveEnd }) => {
  const theme = useTheme();
  const shapeRef = useRef<Konva.Shape>();
  return (
    <Shape
      x={position.x}
      y={position.y}
      ref={shapeRef as any}
      onMouseDown={(e) => {
        if (e.evt.button === 0) {
          shapeRef.current?.startDrag(e);
          e.cancelBubble = true;
        }
      }}
      onMouseUp={(e) => {
        if (e.evt.button === 0) {
          onClick();
        }
      }}
      sceneFunc={(context, shape) => {
        // custom scene function for rendering an "absolute" radius circle
        const absoluteScale = shape.getAbsoluteScale();
        const radius = ANCHOR_RADIUS / absoluteScale.x;
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
const EditablePolygon: React.SFC<Props & Omit<Konva.LineConfig, 'points'> & KonvaNodeEvents> = ({ polygon, onUpdate, adding, onAdded, selectable, selected, onSelected, closed, ...lineProps }) => {
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

        const firstVertex = localVerticies[0];
        if (
          closed && firstVertex && onAdded &&
          Math.sqrt((relPos.x - firstVertex.x) ** 2 + (relPos.y - firstVertex.y) ** 2) < ANCHOR_RADIUS / stage.getAbsoluteScale().x
        ) {
          polygon.verticies = [...localVerticies, firstVertex];
          onUpdate(polygon);
          onAdded();
          return;
        }

        polygon.verticies = [...localVerticies, relPos];
        onUpdate(polygon);
      }

      stage.on('mouseup.konva', handleClick);
      return () => {
        stage.off('mouseup.konva', handleClick);
        stage.container().style.cursor = 'default';
      };
    }
  }, [groupRef, adding, localVerticies, onUpdate, onAdded, polygon, closed])

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
      x={groupX}
      y={groupY}
      listening={selectable}
      onClick={e => {
        if (e.evt.button === 0 && onSelected && selectable) {
          e.cancelBubble = true;
          onSelected();
        }
      }}
      onMouseDown={(e) => {
        if (e.evt.button === 0 && selected && !adding) {
          groupRef.current?.startDrag(e);
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
        closed={closed}
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
              onClick={() => {
                console.log(i, 'clicked');
                if (adding && i === 0 && onAdded) {
                  onAdded();
                }
              }}
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
              firstAnchor={closed && adding && i === 0}
            />
          ))}
        </>
      )}
    </Group>
  );
};
export default EditablePolygon;