import React, { useRef, useEffect } from 'react';
import { KonvaNodeEvents, Line, Group, Shape } from 'react-konva';
import { useTheme } from 'sancho';
import Konva from 'konva';

import { IPolygon } from './rayCaster';
import { Vector2d } from 'konva/types/types';
import { KonvaEventObject } from 'konva/types/Node';
import { useKeyPress } from '../../../utils';

const Anchor: React.SFC<{ position: Vector2d, onMove: (position: Vector2d, e:any) => void }> = ({ position, onMove }) => {
  const theme = useTheme();
  return (
    <Shape
      x={position.x}
      y={position.y}
      draggable={true}
      sceneFunc={(context, shape) => {
        // custom scene function for rendering an "absolute" radius circle
        const absoluteScale = shape.getAbsoluteScale();
        const radius = 5 / absoluteScale.x;
        context.beginPath();
        context.ellipse(0, 0, radius, radius, 0, 0, Math.PI * 2, false);
        context.closePath();
        context.fillStrokeShape(shape);
      }}
      onDragMove={e => {
        onMove({ x: e.target.x(), y: e.target.y() },e);
        e.cancelBubble = true;
      }}
      stroke={theme.colors.palette.blue.base}
      strokeWidth={1}
      strokeScaleEnabled={false}
    />
  )
}

interface Props {
  polygon: IPolygon
  onUpdate: (polygon: IPolygon) => void

  adding: boolean
  onAdded: () => void

  selectable: boolean
  selected: boolean
  onSelected?: () => void
}
const EditablePolygon: React.SFC<Props & Omit<Konva.LineConfig, 'points'> & KonvaNodeEvents> = ({ polygon, onUpdate, adding, onAdded, selectable, selected, onSelected, ...lineProps }) => {
  const theme = useTheme();
  const groupRef = useRef<Konva.Group>();

  const groupX = polygon.verticies.reduce((min, v) => Math.min(min, v.x), Number.MAX_VALUE);
  const groupY = polygon.verticies.reduce((min, v) => Math.min(min, v.y), Number.MAX_VALUE);

  const relativeKonvaCoordinates = polygon.verticies
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

        polygon.verticies = [
          ...polygon.verticies,
          relPos
        ];
        onUpdate(polygon);
      }

      stage.on('mouseup.konva', handleClick);
      return () => {
        stage.off('mouseup.konva', handleClick);
        stage.container().style.cursor = 'default';
      };
    }
  }, [groupRef, adding, polygon, onUpdate])

  const isShiftPressed = useKeyPress('Shift');

  const isEscapePressed = useKeyPress('Escape');
  const isEnterPressed = useKeyPress('Enter');
  const shouldEndAdd = isEnterPressed || isEscapePressed;
  useEffect(() => {
    if (adding && shouldEndAdd) {
      onAdded();
    }
  }, [adding, shouldEndAdd, onAdded])

  return (
    <Group
      ref={groupRef as any}
      draggable={selected && !adding}
      x={groupX}
      y={groupY}
      onMouseDown={e => {
        if (!(e.evt.buttons === 1 && !isShiftPressed)) { // only allow left click, when shift isn't pressed
          groupRef.current?.setDraggable(false)
        }
      }}
      onMouseUp={e => {
        groupRef.current?.setDraggable(selected) // reset the draggable
        if (e.evt.button === 0 && onSelected && selectable) {
          e.cancelBubble = true;
          onSelected();
        }
      }}
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

        polygon.verticies = polygon.verticies.map((v) => ({ x: v.x + offsetX, y: v.y + offsetY }))
        onUpdate(polygon);
      }}
    >
      <Line
        closed={true}
        stroke={selected ? theme.colors.palette.blue.base : undefined}
        strokeWidth={selected ? 1 : undefined}
        strokeScaleEnabled={selected ? false : undefined}
        {...lineProps}
        points={relativeKonvaCoordinates}
        shadowEnabled={true}
      />
      {selected && (
        polygon.verticies.map((v, i) => (
          <Anchor
            key={i}
            position={{ x: v.x - groupX, y: v.y - groupY }}
            onMove={(newPos,e) => {
              const v2 = { x: newPos.x + groupX, y: newPos.y + groupY };
              polygon.verticies[i] = v2;

              const groupX2 = polygon.verticies.reduce((min, v) => Math.min(min, v.x), Number.MAX_VALUE);
              const groupY2 = polygon.verticies.reduce((min, v) => Math.min(min, v.y), Number.MAX_VALUE);

              const newRelative = { x: v2.x - groupX2, y: v2.y - groupY2 };
              e.target.x(newRelative.x)
              e.target.y(newRelative.y)

              onUpdate(polygon)
            }}
          />
        ))
      )}
    </Group>
  );
};
export default EditablePolygon;