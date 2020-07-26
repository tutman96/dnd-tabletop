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
};
const TransformableAsset: React.SFC<Props> = ({ rectTransform, onTransform, isSelected, onSelected, children, rotateEnabled, scaleEnabled, skewEnabled }) => {
	const theme = useTheme();

	const groupRef = useRef<Konva.Group>();
	const trRef = useRef<Konva.Transformer>();

	useEffect(() => {
		if (isSelected) {
			// we need to attach transformer manually
			trRef.current?.setNode(groupRef.current);
			trRef.current?.getLayer()?.batchDraw();
		}
	}, [isSelected]);

	const isShiftPressed = useKeyPress('Shift');

	return (
		<React.Fragment>
			<Group
				onClick={(e) => {
					if (e.evt.button === 0) {
						onSelected();
						e.cancelBubble = true;
					}
					else {
						e.cancelBubble = false
					}
				}}
				ref={groupRef as any}
				draggable={isSelected}
				x={rectTransform.x}
				y={rectTransform.y}
				height={rectTransform.height}
				width={rectTransform.width}
				rotation={rectTransform.rotation}
				onDragStart={e => {
					if (!(e.evt.buttons === 1 && !isShiftPressed)) { // only allow left click, when shift isn't pressed
						groupRef.current?.setDraggable(false)
						e.cancelBubble = false;
					}
				}}
				onMouseUp={() => {
					groupRef.current?.setDraggable(isSelected) // reset the draggable
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