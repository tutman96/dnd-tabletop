import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useTheme, IconCrosshair, Check } from 'sancho';
import Konva from 'konva';
import { Layer, Rect, Line, Group } from 'react-konva';
import { Vector2d } from 'konva/types/types';

import { useTableResolution, useTablePPI } from '../../settings';
import { TableOptions } from '..';
import { ILayerComponentProps, ILayer, LayerType } from '.';
import ToolbarItem from './toolbarItem';
import ToolbarPortal from './toolbarPortal';
import { useKeyPress } from '../../utils';

export const TableViewLayer = {
  id: 'TABLE_VIEW',
  name: 'Table View',
  type: LayerType.TABLE_VIEW,
  visible: true
} as ILayer;

export interface ITableViewLayer extends ILayer {
  options: TableOptions
}

interface Props extends ILayerComponentProps<ITableViewLayer> {
  showBorder: boolean;
  showGrid: boolean;
}

const TableViewOverlay: React.SFC<Props> = ({ layer, active, showBorder, showGrid, onUpdate }) => {
  const theme = useTheme();
  const [tableResolution] = useTableResolution();
  const ppi = useTablePPI();

  const [localOptions, setLocalOptions] = useState(layer.options);

  useEffect(() => {
    setLocalOptions(layer.options);
  }, [layer.options, setLocalOptions])

  const groupRef = useRef<Konva.Group>();

  const toolbar = useMemo(() => {
    return (
      <>
        <ToolbarItem
          icon={<IconCrosshair />}
          label="Reset View"
          onClick={() => {
            onUpdate({
              ...layer,
              options: {
                ...localOptions,
                offset: { x: 0, y: 0 },
                rotation: 0,
                scale: 1
              }
            })
          }}
        />
        <Check label="Display Grid" checked={localOptions.displayGrid} onChange={(e) => {
          onUpdate({
            ...layer,
            options: {
              ...localOptions,
              displayGrid: e.target.checked
            }
          })
        }} />
      </>
    );
  }, [layer, localOptions, onUpdate]);

  const isShiftPressed = useKeyPress('Shift');

  if (!tableResolution || ppi === null) {
    return null;
  }

  const width = tableResolution.width;
  const height = tableResolution.height;

  const lines = new Array<{ start: Vector2d; end: Vector2d; }>();

  // Only generate the grid within the table display to save on the number of lines needed.
  if (showGrid) {
    const startX = Math.floor(localOptions.offset.x / ppi) * ppi;
    for (let xOffset = startX; xOffset <= localOptions.offset.x + tableResolution.width; xOffset += ppi) {
      lines.push({
        start: { x: xOffset, y: localOptions.offset.y },
        end: { x: xOffset, y: localOptions.offset.y + tableResolution.height }
      });
    }

    const startY = Math.floor(localOptions.offset.y / ppi) * ppi;
    for (let yOffset = startY; yOffset <= localOptions.offset.y + tableResolution.height; yOffset += ppi) {
      lines.push({
        start: { x: localOptions.offset.x, y: yOffset },
        end: { x: localOptions.offset.x + tableResolution.width, y: yOffset }
      });
    }
  }

  return (
    <Layer>
      {active && <ToolbarPortal>{toolbar}</ToolbarPortal>}
      <Group
        clipFunc={(ctx: CanvasRenderingContext2D) => {
          ctx.beginPath();
          ctx.rect(localOptions.offset.x, localOptions.offset.y, width, height);
          ctx.rotate(localOptions.rotation);
          ctx.closePath();
        }}
        listening={active}
      >
        {lines.map((line, i) => (
          <React.Fragment key={i}>
            <Line
              key={`l${i}`}
              points={[line.start.x, line.start.y, line.end.x, line.end.y]}
              stroke={theme.colors.palette.gray.light}
              dash={[1, 1]}
              strokeWidth={1}
              strokeScaleEnabled={false}
            />
            <Line
              key={`d${i}`}
              points={[line.start.x, line.start.y, line.end.x, line.end.y]}
              stroke={theme.colors.palette.gray.dark}
              dash={[1, 1]}
              dashOffset={1}
              strokeWidth={1}
              strokeScaleEnabled={false}
            />
          </React.Fragment>
        ))}
      </Group>

      {(showBorder || active) ?
        <>
          <Group
            ref={groupRef as any}
            draggable={active}
            x={localOptions.offset.x}
            y={localOptions.offset.y}
            width={width}
            height={height}
            rotation={localOptions.rotation}
            onMouseDown={e => {
              if (!(e.evt.buttons === 1 && !isShiftPressed)) { // only allow left click, when shift isn't pressed
                groupRef.current?.setDraggable(false)
              }
              else {
                groupRef.current?.setDraggable(active)
              }
            }}
            onMouseUp={() => {
              groupRef.current?.setDraggable(active) // reset the draggable
            }}
            onDragMove={e => {
              const node = groupRef.current!;
              const rotation = node.rotation();
              setLocalOptions({
                offset: {
                  x: e.target.x(),
                  y: e.target.y(),
                },
                rotation,
                displayGrid: localOptions.displayGrid,
                scale: localOptions.scale
              });
            }}
            onDragEnd={() => {
              onUpdate({
                ...layer,
                options: localOptions
              })
            }}
          >
            <Rect
              width={width}
              height={height}
              stroke={active ? theme.colors.palette.blue.base : theme.colors.palette.gray.light}
              dash={[10, 10]}
              strokeWidth={5}
              listening={active}
            />
          </Group>
        </>
        : null
      }
    </Layer>
  );
};

export default TableViewOverlay;