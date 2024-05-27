import React, {useRef, useEffect, useCallback} from 'react';
import Konva from 'konva';
import {Stage} from 'react-konva';
import {SxProps} from '@mui/system';

import PanZoomControl from './panZoomControl';

import Box from '@mui/material/Box';

const TINT1 = '#3f3f3f';
const TINT2 = '#353535';

const ZOOM_SPEED = 1 / 250;
const PAN_SPEED = 1 / 1;
const KEYBOARD_ZOOM_SPEED = 1.15;

type Props = {
  initialZoom?: number;
  width: number;
  height: number;
  sx?: SxProps;
};
const DraggableStage: React.FunctionComponent<
  React.PropsWithChildren<Props>
> = ({initialZoom = 1, width, height, sx, children}) => {
  const stageRef = useRef<Konva.Stage>();

  const zoomStageFromMiddle = useCallback(
    (deltaZ: number) => {
      if (deltaZ === 1 || !stageRef.current) return;
      const stage = stageRef.current;

      const stageSize = stage.getSize();
      const absoluteCenterOfViewport = {
        x: stageSize.width / 2,
        y: stageSize.height / 2,
      };

      const oldZoom = stage.scaleX();
      const absoluteOffset = {
        x: (absoluteCenterOfViewport.x - stage.x()) / oldZoom,
        y: (absoluteCenterOfViewport.y - stage.y()) / oldZoom,
      };

      const newZoom = deltaZ > 0 ? oldZoom * deltaZ : oldZoom / -deltaZ;
      stage.scale({x: newZoom, y: newZoom});
      stage.setPosition({
        x: absoluteCenterOfViewport.x - absoluteOffset.x * newZoom,
        y: absoluteCenterOfViewport.y - absoluteOffset.y * newZoom,
      });
    },
    [stageRef]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const zoomInPressed = e.code === 'Equal';
      const zoomOutPressed = e.code === 'Minus';
      if ((e.ctrlKey || e.metaKey) && (zoomInPressed || zoomOutPressed)) {
        e.preventDefault();
        zoomStageFromMiddle(
          zoomInPressed ? KEYBOARD_ZOOM_SPEED : -KEYBOARD_ZOOM_SPEED
        );
        stageRef.current?.batchDraw();
      }
    };
    window.document.addEventListener('keydown', onKeyDown);
    return () => {
      window.document.removeEventListener('keydown', onKeyDown);
    };
  }, [stageRef, zoomStageFromMiddle]);

  const onPanZoom = useCallback(
    dir => {
      if (stageRef.current) {
        zoomStageFromMiddle(Math.abs(1 + dir.z * 0.005));

        const stage = stageRef.current;
        const currentX = stage.x();
        const currentY = stage.y();

        const newX = currentX - dir.x * 2;
        const newY = currentY - dir.y * 2;

        stage.position({
          x: newX,
          y: newY,
        });
        stage.batchDraw();
      }
    },
    [stageRef, zoomStageFromMiddle]
  );

  const onHome = useCallback(() => {
    if (stageRef.current) {
      stageRef.current.position({x: 0, y: 0});
      stageRef.current.scale({x: initialZoom, y: initialZoom});
      stageRef.current.batchDraw();
    }
  }, [stageRef, initialZoom]);

  useEffect(() => {
    if (stageRef.current) {
      stageRef.current.scale({x: initialZoom, y: initialZoom});
      stageRef.current.batchDraw();
    }
  }, [stageRef]);

  return (
    <Box
      sx={{
        backgroundColor: TINT2,
        backgroundImage: `linear-gradient(45deg, ${TINT1} 25%, transparent 25%, transparent 75%, ${TINT1} 75%, ${TINT1}), linear-gradient(45deg, ${TINT1} 25%, transparent 25%, transparent 75%, ${TINT1} 75%, ${TINT1})`,
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 10px 10px',
        width,
        height,
        ...sx,
      }}
    >
      <PanZoomControl onPanZoom={onPanZoom} onHome={onHome} />
      <Stage
        ref={stageRef as any}
        width={width}
        height={height}
        onMouseDown={e => {
          if (e.evt.button === 1 || e.evt.button === 2) {
            stageRef.current?.startDrag(e);
            e.cancelBubble = true;
          }
        }}
        onWheel={e => {
          e.evt.preventDefault();

          const deltaX = -e.evt.deltaX;
          let deltaY = -e.evt.deltaY;
          let deltaZ = 0;

          if (e.evt.ctrlKey) {
            deltaZ = deltaY;
            deltaY = 0;
          }

          const stage = stageRef.current!;
          const oldZoom = stage.scaleX();
          const pointerPosition = stage.getPointerPosition();

          if (!pointerPosition) {
            return;
          }

          const mousePointTo = {
            x: (pointerPosition.x - stage.x()) / oldZoom,
            y: (pointerPosition.y - stage.y()) / oldZoom,
          };

          if (deltaX === 0 && deltaY === 0 && deltaZ === 0) {
            return;
          }

          const zoomSpeed = 1 + Math.abs(deltaZ) * ZOOM_SPEED;
          const newZoom =
            deltaZ < 0 ? oldZoom / zoomSpeed : oldZoom * zoomSpeed;
          stage.scale({x: newZoom, y: newZoom});

          const newPos = {
            // x: (pointerPosition.x - mousePointTo.x + (deltaX * PAN_SPEED)) * newZoom,
            // y: (pointerPosition.y - mousePointTo.y + (deltaY * PAN_SPEED)) * newZoom,
            x:
              pointerPosition.x - mousePointTo.x * newZoom + deltaX * PAN_SPEED,
            y:
              pointerPosition.y - mousePointTo.y * newZoom + deltaY * PAN_SPEED,
          };
          stage.position(newPos);
          stage.batchDraw();
        }}
        onContextMenu={e => {
          e.evt.preventDefault();
          return false;
        }}
      >
        {children}
      </Stage>
    </Box>
  );
};
export default DraggableStage;
