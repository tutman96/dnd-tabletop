import React, { useRef, useEffect } from 'react';
import { Group, Transformer } from 'react-konva';
import Konva from 'konva';
import { IRect } from 'konva/types/types';
import { useTheme } from 'sancho';
import { useKeyPress } from '../../utils';

export type AssetTransform = IRect & { rotation: number };

type Props = {
	rectTransform: AssetTransform,
	onTransform: (newRect: AssetTransform) => void,
	isSelected: boolean,
	onSelected: () => void,
	scaleEnabled?: boolean;
	skewEnabled?: boolean;
	rotateEnabled?: boolean;
	strokeEnabled?: boolean;
};
const TransformableAsset: React.SFC<Props> = ({ rectTransform, onTransform, isSelected, onSelected, children, rotateEnabled, scaleEnabled, skewEnabled, strokeEnabled }) => {
	const theme = useTheme();

	const groupRef = useRef<Konva.Group>();
	const trRef = useRef<Konva.Transformer>();

	useEffect(() => {
		if (isSelected) {
			// we need to attach transformer manually
			trRef.current?.setNodes([groupRef.current!]);
			trRef.current?.getLayer()?.batchDraw();
		}
	}, [isSelected]);

	const isShiftPressed = useKeyPress('Shift');

	return (
		<React.Fragment>
			<Group
				ref={groupRef as any}
				draggable={isSelected}
				x={rectTransform.x}
				y={rectTransform.y}
				height={rectTransform.height}
				width={rectTransform.width}
				rotation={rectTransform.rotation}
				onMouseDown={e => {
					if (!(e.evt.buttons === 1 && !isShiftPressed)) { // only allow left click, when shift isn't pressed
						groupRef.current?.setDraggable(false)
					}
					else {
						groupRef.current?.setDraggable(isSelected)
					}
				}}
				onMouseUp={e => {
					groupRef.current?.setDraggable(isSelected) // reset the draggable
					if (e.evt.button === 0) {
						e.cancelBubble = true;
						onSelected();
					}
				}}
				onClick={e => {
					if (e.evt.button === 0) {
						e.cancelBubble = true;
						onSelected();
					}
				}}
				onDragEnd={e => {
					const node = groupRef.current!;
					const scaleX = node.scaleX();
					const scaleY = node.scaleY();
					const rotation = node.rotation();
					onTransform({
						x: e.target.x(),
						y: e.target.y(),
						rotation,
						width: Math.max(5, node.width() * scaleX),
						height: Math.max(node.height() * scaleY)
					});
				}}
				onTransformEnd={e => {
					const node = groupRef.current!;
					const scaleX = node.scaleX();
					const scaleY = node.scaleY();
					const rotation = node.rotation();

					node.scaleX(1);
					node.scaleY(1);

					onTransform({
						x: node.x(),
						y: node.y(),
						rotation,
						width: node.width() * scaleX,
						height: node.height() * scaleY
					});
				}}
			>
				{children}
			</Group>
			{isSelected && (
				<Transformer
					rotateEnabled={rotateEnabled}
					resizeEnabled={scaleEnabled}
					enabledAnchors={skewEnabled === false ? ['top-left', 'top-right', 'bottom-left', 'bottom-right'] : undefined}
					ref={trRef as any}
					borderStrokeWidth={strokeEnabled === false ? 0 : undefined}
					anchorFill={theme.colors.background.overlay}
					anchorStroke={theme.colors.palette.blue.light}
					rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
					rotateAnchorOffset={20}
				/>
			)}
		</React.Fragment>
	);
}
export default TransformableAsset;