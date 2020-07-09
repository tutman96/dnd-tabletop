import React, { useRef, useState } from 'react';
import useComponentSize from '@rehooks/component-size';
import { css } from 'emotion';
import Konva from 'konva';
import { Stage } from 'react-konva';
import { useTheme } from 'sancho';
import { SCENE_LIST_WIDTH } from '../list';
import { HEADER_HEIGHT } from '../editor';

const ZOOM_SPEED = 1.1;

type Props = { onClick?: () => void, draggable?: boolean };
const DraggableStage: React.SFC<Props> = ({ children, onClick, draggable }) => {
	const theme = useTheme();

	const containerRef = useRef<HTMLDivElement>(null);
	const containerSize = useComponentSize(containerRef);
	const stageRef = useRef<Konva.Stage>();

	const [zoom, setZoom] = useState(1);

	return (
		<div
			ref={containerRef}
			className={css`
				flex-grow: 2;
				width: calc(100vw - ${SCENE_LIST_WIDTH + 48}px);
				height: calc(100vh - ${HEADER_HEIGHT}px);
				
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
				onClick={onClick}
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

					var newZoom =
						e.evt.deltaY > 0 ? oldScale / ZOOM_SPEED : oldScale * ZOOM_SPEED;

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