import React from 'react';
import { Layer, Rect, Line } from 'react-konva';
import { useTheme } from 'sancho';
import { useTableResolution, useTablePPI } from '../../settings';
import { Vector2d } from 'konva/types/types';

type Props = { offset: Vector2d; rotation: number; showBorder: boolean; showGrid: boolean; };
const TableViewOverlay: React.SFC<Props> = ({ offset, rotation, showGrid, showBorder }) => {
  const theme = useTheme();
  const [tableResolution] = useTableResolution();
  const ppi = useTablePPI();

  if (!tableResolution || ppi === null) {
    return null;
  }

  const lines = new Array<{ start: Vector2d; end: Vector2d; }>();

  if (showGrid) {
    for (let xOffset = 0; xOffset <= tableResolution.width; xOffset += ppi) {
      lines.push({
        start: { x: xOffset, y: 0 },
        end: { x: xOffset, y: tableResolution.height }
      });
    }

    for (let yOffset = 0; yOffset <= tableResolution.height; yOffset += ppi) {
      lines.push({
        start: { x: 0, y: yOffset },
        end: { x: tableResolution.width, y: yOffset }
      });
    }
  }

  return (
    <Layer>
      {lines.map((line, i) => (
        <Line
          key={i}
          x={offset.x}
          y={offset.y}
          rotation={rotation}
          points={[line.start.x, line.start.y, line.end.x, line.end.y]}
          stroke={theme.colors.palette.gray.dark}
          dash={[1, 1]}
          strokeWidth={1} />
      ))}
      {showBorder &&
        <Rect
          x={offset.x}
          y={offset.y}
          rotation={rotation}
          width={tableResolution.width}
          height={tableResolution.height}
          stroke={theme.colors.palette.gray.light}
          dash={[10, 10]}
          strokeWidth={5}
          listening={false} />}
    </Layer>
  );
};

export default TableViewOverlay;