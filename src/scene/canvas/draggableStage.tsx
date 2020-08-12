import React, { useRef, useState, useEffect } from 'react';
import useComponentSize from '@rehooks/component-size';
import { css } from 'emotion';
import Konva from 'konva';
import { Stage } from 'react-konva';
import { useTheme } from 'sancho';

const ZOOM_SPEED = 1 / 250;
const PAN_SPEED = 1 / 1;
const KEYBOARD_ZOOM_SPEED = 1.15;

type Props = { initialZoom?: number, className?: string };
const DraggableStage: React.SFC<Props> = ({ initialZoom = 1, className, children }) => {
	const theme = useTheme();

	const containerRef = useRef<HTMLDivElement>(null);
	const containerSize = useComponentSize(containerRef);
	const stageRef = useRef<Konva.Stage>();

	const [zoom, setZoom] = useState(initialZoom);

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			const zoomInPressed = e.code === 'Equal';
			const zoomOutPressed = e.code === 'Minus';
			if ((e.ctrlKey || e.metaKey) && (zoomInPressed || zoomOutPressed)) {
				e.preventDefault();
				const stage = stageRef.current!;

				const stageSize = stage.getSize();
				const absoluteCenterOfViewport = {
					x: stageSize.width / 2,
					y: stageSize.height / 2
				};
				
				const oldZoom = zoom;
				const absoluteOffset = {
					x: (absoluteCenterOfViewport.x - stage.x()) / oldZoom,
					y: (absoluteCenterOfViewport.y - stage.y()) / oldZoom,
				};

				const newZoom = zoomInPressed ? oldZoom * KEYBOARD_ZOOM_SPEED : oldZoom / KEYBOARD_ZOOM_SPEED;
				setZoom(newZoom);
				stage.scale({ x: newZoom, y: newZoom });
				stage.setPosition({
					x: absoluteCenterOfViewport.x - absoluteOffset.x * newZoom,
					y: absoluteCenterOfViewport.y - absoluteOffset.y * newZoom,
				});
			}
		}
		window.document.addEventListener('keydown', onKeyDown);
		return () => { window.document.removeEventListener('keydown', onKeyDown) };
	}, [zoom, stageRef])

	return (
		<div
			ref={containerRef}
			className={css`				
				background-color: ${theme.colors.background.tint2};
				background-image: linear-gradient(45deg, ${theme.colors.background.tint1} 25%, transparent 25%, transparent 75%, ${theme.colors.background.tint1} 75%, ${theme.colors.background.tint1}),
				linear-gradient(45deg, ${theme.colors.background.tint1} 25%, transparent 25%, transparent 75%, ${theme.colors.background.tint1} 75%, ${theme.colors.background.tint1});
				background-size: 20px 20px;
				background-position: 0 0, 10px 10px;
			` + (className ? ` ${className}` : '')}
		>
			<Stage
				ref={stageRef as any}
				width={containerSize.width || 1}
				height={containerSize.height || 1}
				scale={{ x: zoom, y: zoom }}
				onMouseDown={(e) => {
					if (e.evt.button === 1 || e.evt.button === 2) {
						stageRef.current?.startDrag(e);
						e.cancelBubble = true;
					}
				}}
				onWheel={(e) => {
					e.evt.preventDefault();

					let deltaX = -e.evt.deltaX;
					let deltaY = -e.evt.deltaY;
					let deltaZ = 0;

					if (e.evt.ctrlKey) {
						deltaZ = deltaY;
						deltaY = 0;
					}

					const oldZoom = zoom;

					const stage = stageRef.current!;
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

					const zoomSpeed = 1 + (Math.abs(deltaZ) * ZOOM_SPEED);
					const newZoom = deltaZ < 0 ? oldZoom / zoomSpeed : oldZoom * zoomSpeed;
					setZoom(newZoom);

					var newPos = {
						// x: (pointerPosition.x - mousePointTo.x + (deltaX * PAN_SPEED)) * newZoom,
						// y: (pointerPosition.y - mousePointTo.y + (deltaY * PAN_SPEED)) * newZoom,
						x: pointerPosition.x - mousePointTo.x * newZoom + deltaX * PAN_SPEED,
						y: pointerPosition.y - mousePointTo.y * newZoom + deltaY * PAN_SPEED,
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