import React, { useMemo, useRef, useEffect, useState } from 'react';
import Konva from 'konva';
import { Layer, Rect, Line, Group, Transformer } from 'react-konva';

import { grey } from '@mui/material/colors';

import AnchorOutlinedIcon from '@mui/icons-material/AnchorOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

import { useTableDimensions } from '../../../settings';
import ToolbarItem from '../toolbarItem';
import ToolbarPortal from '../toolbarPortal';
import ZoomToolbarItem from './zoomToolbarItem';
import theme from '../../../theme';
import * as Types from "../../../protos/scene";

export const TABLEVIEW_LAYER_ID = 'TABLE_VIEW';

type Props = {
  options: Types.TableOptions,
  active: boolean;
  showBorder: boolean;
  showGrid: boolean;
  onUpdate: (options: Types.TableOptions) => void
}
const TableViewOverlay: React.FunctionComponent<Props> = ({ options, active, showBorder, showGrid, onUpdate }) => {
  const tableDimensions = useTableDimensions();

  const [localOptions, setLocalOptions] = useState(options);

  useEffect(() => {
    setLocalOptions(options);
  }, [options])

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
          icon={<AnchorOutlinedIcon />}
          label="Reset View"
          onClick={() => {
            onUpdate({
              ...options,
              offset: { x: 0, y: 0 },
              rotation: 0,
              scale: 1
            })
          }}
        />
        <ToolbarItem
          label={options.displayGrid ? 'Hide Grid' : 'Show Grid'}
          icon={options.displayGrid ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
          onClick={() => {
            onUpdate({
              ...options,
              displayGrid: !options.displayGrid
            })
          }}
        />
        <ZoomToolbarItem
          zoom={options.scale}
          onUpdate={(zoom) => {
            onUpdate({
              ...options,
              scale: zoom
            });
          }}
        />
      </>
    );
  }, [options, onUpdate]);

  // Only recalculate the line components when the position/size changes
  const lines = useMemo(() => {
    if (!tableDimensions) {
      return null;
    }

    const width = tableDimensions.width / localOptions.scale;
    const height = tableDimensions.height / localOptions.scale;
    const offset = localOptions.offset!;

    const l = new Array<{ start: Konva.Vector2d; end: Konva.Vector2d; }>();
    if (showGrid) {
      const startX = Math.floor(offset.x);
      for (let xOffset = startX; xOffset <= offset.x + width; xOffset++) {
        l.push({
          start: { x: xOffset, y: offset.y },
          end: { x: xOffset, y: offset.y + height }
        });
      }

      const startY = Math.floor(offset.y);
      for (let yOffset = startY; yOffset <= offset.y + height; yOffset++) {
        l.push({
          start: { x: offset.x, y: yOffset },
          end: { x: offset.x + width, y: yOffset }
        });
      }
    }

    return (
      <Group
        clipFunc={(ctx: CanvasRenderingContext2D) => {
          ctx.beginPath();
          ctx.rect(offset.x, offset.y, width, height);
          ctx.rotate(localOptions.rotation);
          ctx.closePath();
        }}
        opacity={localOptions.displayGrid ? (active ? 1 : 0.75) : (active ? 0.5 : 0)}
      >
        {l.map((line, i) => (
          <React.Fragment key={i}>
            <Line
              key={`l${i}`}
              points={[line.start.x, line.start.y, line.end.x, line.end.y]}
              stroke={grey[100]}
              dash={[1, 1]}
              strokeWidth={1}
              strokeScaleEnabled={false}
            />
            <Line
              key={`d${i}`}
              points={[line.start.x, line.start.y, line.end.x, line.end.y]}
              stroke={grey[900]}
              dash={[1, 1]}
              dashOffset={1}
              strokeWidth={1}
              strokeScaleEnabled={false}
            />
          </React.Fragment>
        ))}
      </Group>
    );
  }, [showGrid, localOptions, active, tableDimensions])

  if (!tableDimensions) {
    return null;
  }

  const width = tableDimensions.width;
  const height = tableDimensions.height;

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
            x={localOptions.offset?.x ?? 0}
            y={localOptions.offset?.y ?? 0}
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
              onUpdate({
                ...localOptions
              })
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
              onUpdate({ ...localOptions });
            }}
          >
            <Rect
              width={width}
              height={height}
              stroke={active ? theme.palette.primary.dark : grey[300]}
              dash={[10, 10]}
              strokeWidth={3}
              strokeScaleEnabled={false}
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
              ignoreStroke={true}
              anchorFill={theme.palette.primary.contrastText}
              anchorStroke={theme.palette.primary.dark}
            />
          )}
        </>
        : null
      }
    </Layer>
  );
};

export default TableViewOverlay;