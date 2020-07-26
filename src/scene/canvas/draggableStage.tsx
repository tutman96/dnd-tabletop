import React, { useRef, useState } from 'react';
import useComponentSize from '@rehooks/component-size';
import { css } from 'emotion';
import Konva from 'konva';
import { Stage } from 'react-konva';

import { useKeyPress } from '../../utils';
import { useExtendedTheme } from '../../theme';

const ZOOM_SPEED = 1 / 250;

Konva.dragButtons = [0, 1, 2];

type Props = { draggable?: boolean };
const DraggableStage: React.SFC<Props> = ({ children, draggable }) => {
	const theme = useExtendedTheme();

	const containerRef = useRef<HTMLDivElement>(null);
	const containerSize = useComponentSize(containerRef);
	const stageRef = useRef<Konva.Stage>();

	const [zoom, setZoom] = useState(1);
	const isShiftPressed = useKeyPress('Shift');

	return (
		<div
			ref={containerRef}
			className={css`
				flex-grow: 2;
				width: calc(100vw - ${theme.sceneListWidth + theme.sidebarWidth}px);
				height: calc(100vh - ${theme.headerHeight}px);
				
				background-color: ${theme.colors.background.tint2};
				background-image: linear-gradient(45deg, ${theme.colors.background.tint1} 25%, transparent 25%, transparent 75%, ${theme.colors.background.tint1} 75%, ${theme.colors.background.tint1}),
				linear-gradient(45deg, ${theme.colors.background.tint1} 25%, transparent 25%, transparent 75%, ${theme.colors.background.tint1} 75%, ${theme.colors.background.tint1});
				background-size: 20px 20px;
				background-position: 0 0, 10px 10px;
			`}
		>
			<Stage
				ref={stageRef as any}
				width={containerSize.width}
				height={containerSize.height}
				draggable={draggable === undefined ? true : draggable}
				onDragStart={(e) => {
					if (e.evt.buttons === 1 && !isShiftPressed) { // allow left only when shift is pressed
						stageRef.current?.setDraggable(false)
					}
				}}
				onMouseUp={() => {
					stageRef.current?.setDraggable(draggable === undefined ? true : draggable) // reset the draggable
				}}
				scale={{ x: zoom, y: zoom }}
				onWheel={(e) => {
					e.evt.preventDefault();
					const oldScale = zoom;

					const stage = stageRef.current!;
					const pointer = stage.getPointerPosition();

					if (!pointer) {
						return;
					}

					var mousePointTo = {
						x: (pointer.x - stage.x()) / oldScale,
						y: (pointer.y - stage.y()) / oldScale,
					};

					const deltaY = e.evt.deltaY;
					if (deltaY === 0) {
						return;
					}

					const zoomSpeed = 1 + (Math.abs(deltaY) * ZOOM_SPEED);

					var newZoom =
						e.evt.deltaY > 0 ? oldScale / zoomSpeed : oldScale * zoomSpeed;

					setZoom(newZoom);

					var newPos = {
						x: pointer.x - mousePointTo.x * newZoom,
						y: pointer.y - mousePointTo.y * newZoom,
					};
					stage.position(newPos);
					stage.batchDraw();
				}}
				onContextMenu={(e) => {
					e.evt.preventDefault();
					return false;
				}}
			>
				{children}
			</Stage>
		</div>
	);
}
export default DraggableStage;