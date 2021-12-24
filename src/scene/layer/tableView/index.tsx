import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useTheme, IconCrosshair, IconEye, IconEyeOff } from 'sancho';
import Konva from 'konva';
import { Layer, Rect, Line, Group, Transformer } from 'react-konva';

import { useTableResolution, useTablePPI } from '../../../settings';
import { TableOptions } from '../..';
import { ILayerComponentProps, ILayer } from '..';
import LayerType from "../layerType";
import ToolbarItem from '../toolbarItem';
import ToolbarPortal from '../toolbarPortal';
import ZoomToolbarItem from './zoomToolbarItem';

export const TableViewLayer = {
  id: 'TABLE_VIEW',
  name: 'TV/Table View',
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
  const trRef = useRef<Konva.Transformer>();

  useEffect(() => {
    if (active) {
      // we need to attach transformer manually
      trRef.current?.setNodes([groupRef.current!]);
      trRef.current?.getLayer()?.batchDraw();
    }
  }, [active]);

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
                ...layer.options,
                offset: { x: 0, y: 0 },
                rotation: 0,
                scale: 1
              }
            })
          }}
        />
        <ToolbarItem
          label={layer.options.displayGrid ? 'Hide Grid' : 'Show Grid'}
          icon={layer.options.displayGrid ? <IconEyeOff /> : <IconEye />}
          onClick={() => {
            onUpdate({
              ...layer,
              options: {
                ...layer.options,
                displayGrid: !layer.options.displayGrid
              }
            })
          }}
        />
        <ZoomToolbarItem
          zoom={layer.options.scale}
          onUpdate={(zoom) => {
            layer.options = {
              ...layer.options,
              scale: zoom
            }
            onUpdate(layer);
          }}
        />
      </>
    );
  }, [layer, onUpdate]);

  // Only recalculate the line components when the position/size changes
  const lines = useMemo(() => {
    if (!tableResolution || !ppi) {
      return null;
    }

    const width = tableResolution.width / localOptions.scale;
    const height = tableResolution.height / localOptions.scale;

    const l = new Array<{ start: Konva.Vector2d; end: Konva.Vector2d; }>();
    if (showGrid) {
      const startX = Math.floor(localOptions.offset.x / ppi) * ppi;
      for (let xOffset = startX; xOffset <= localOptions.offset.x + width; xOffset += ppi) {
        l.push({
          start: { x: xOffset, y: localOptions.offset.y },
          end: { x: xOffset, y: localOptions.offset.y + height }
        });
      }

      const startY = Math.floor(localOptions.offset.y / ppi) * ppi;
      for (let yOffset = startY; yOffset <= localOptions.offset.y + height; yOffset += ppi) {
        l.push({
          start: { x: localOptions.offset.x, y: yOffset },
          end: { x: localOptions.offset.x + width, y: yOffset }
        });
      }
    }

    return (
      <Group
        clipFunc={(ctx: CanvasRenderingContext2D) => {
          ctx.beginPath();
          ctx.rect(localOptions.offset.x, localOptions.offset.y, width, height);
          ctx.rotate(localOptions.rotation);
          ctx.closePath();
        }}
        opacity={localOptions.displayGrid ? 1 : (active ? 0.5 : 0)}
      >
        {l.map((line, i) => (
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
    );
  }, [showGrid, localOptions, active, tableResolution, ppi, theme])

  if (!tableResolution || ppi === null) {
    return null;
  }

  const width = tableResolution.width;
  const height = tableResolution.height;

  return (
    <Layer
      listening={active}
    >
      {active && <ToolbarPortal>{toolbar}</ToolbarPortal>}
      {lines}
      {(showBorder || active) ?
        <>
          <Group
            ref={groupRef as any}
            x={localOptions.offset.x}
            y={localOptions.offset.y}
            width={width}
            height={height}
            scaleX={1 / localOptions.scale}
            scaleY={1 / localOptions.scale}
            rotation={localOptions.rotation}
            onMouseDown={e => {
              if (e.evt.button === 0 && active) {
                groupRef.current?.startDrag(e)
                e.cancelBubble = true;
              }
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
              layer.options = { ...localOptions };
              onUpdate(layer)
            }}
            onTransform={() => {
              const node = groupRef.current!;
              const scale = 1 / node.scaleX();
              setLocalOptions({
                ...localOptions,
                offset: {
                  x: node.x(),
                  y: node.y(),
                },
                scale
              });
            }}
            onTransformEnd={() => {
              layer.options = { ...localOptions };
              onUpdate(layer);
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
          {active && (
            <Transformer
              rotateEnabled={false}
              resizeEnabled={true}
              enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
              ref={trRef as any}
              borderStrokeWidth={0}
              anchorFill={theme.colors.background.overlay}
              anchorStroke={theme.colors.palette.blue.light}
            />
          )}
        </>
        : null
      }
    </Layer>
  );
};

export default TableViewOverlay;