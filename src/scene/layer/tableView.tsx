import React, { useMemo } from 'react';
import { Layer, Rect, Line, Group } from 'react-konva';
import { useTheme, IconCrosshair, Check } from 'sancho';
import { useTableResolution, useTablePPI } from '../../settings';
import { Vector2d } from 'konva/types/types';
import { TableOptions } from '..';
import { ILayerComponentProps, ILayer, LayerType } from '.';
import TransformableAsset from '../canvas/transformableAsset';
import ToolbarItem from './toolbarItem';
import ToolbarPortal from './toolbarPortal';

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
  const options = layer.options;
  const theme = useTheme();
  const [tableResolution] = useTableResolution();
  const ppi = useTablePPI();

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
                ...options,
                offset: { x: 0, y: 0 },
                rotation: 0,
                scale: 1
              }
            })
          }}
        />
        <Check label="Display Grid" checked={options.displayGrid} onChange={(e) => {
          onUpdate({
            ...layer,
            options: {
              ...options,
              displayGrid: e.target.checked
            }
          })
        }} />
      </>
    );
  }, [layer, options, onUpdate]);

  if (!tableResolution || ppi === null) {
    return null;
  }

  const width = tableResolution.width;
  const height = tableResolution.height;

  const lines = new Array<{ start: Vector2d; end: Vector2d; }>();

  // Only generate the grid within the table display to save on the number of lines needed.
  if (showGrid) {
    const startX = Math.floor(options.offset.x / ppi) * ppi;
    for (let xOffset = startX; xOffset <= options.offset.x + tableResolution.width; xOffset += ppi) {
      lines.push({
        start: { x: xOffset, y: options.offset.y },
        end: { x: xOffset, y: options.offset.y + tableResolution.height }
      });
    }

    const startY = Math.floor(options.offset.y / ppi) * ppi;
    for (let yOffset = startY; yOffset <= options.offset.y + tableResolution.height; yOffset += ppi) {
      lines.push({
        start: { x: options.offset.x, y: yOffset },
        end: { x: options.offset.x + tableResolution.width, y: yOffset }
      });
    }
  }

  return (
    <Layer>
      {active && <ToolbarPortal>{toolbar}</ToolbarPortal>}
      <Group
        clipFunc={(ctx: CanvasRenderingContext2D) => {
          ctx.beginPath();
          ctx.rect(options.offset.x, options.offset.y, width, height);
          ctx.rotate(options.rotation);
          ctx.closePath();
        }}
        listening={active}
      >
        {lines.map((line, i) => (
          <>
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
          </>
        ))}
      </Group>

      {(showBorder || active) ?
        <TransformableAsset
          rectTransform={{ ...options.offset, rotation: options.rotation, width, height }}
          isSelected={active}
          onSelected={() => { }}
          onTransform={(rect) => {
            onUpdate({
              ...layer,
              options: {
                ...options,
                offset: { x: rect.x, y: rect.y },
                rotation: rect.rotation,
                scale: 1 // TODO
              }
            })
          }}
          rotateEnabled={false}
          skewEnabled={false}
          scaleEnabled={false}
        >
          <Rect
            width={width}
            height={height}
            stroke={theme.colors.palette.gray.light}
            dash={[10, 10]}
            strokeWidth={5}
            listening={active}
          />
        </TransformableAsset>
        : null
      }
    </Layer>
  );
};

export default TableViewOverlay;