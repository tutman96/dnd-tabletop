import React, { useRef, useEffect } from 'react';
import { Group, Transformer } from 'react-konva';
import Konva from 'konva';
import { IRect } from 'konva/types/types';
import { useTheme } from 'sancho';

export type AssetTransform = IRect & { rotation: number };

type Props = { rectTransform: AssetTransform, onTransform: (newRect: AssetTransform) => void, isSelected: boolean, onSelected: () => void };
const TransformableAsset: React.SFC<Props> = ({ rectTransform, onTransform, isSelected, onSelected, children }) => {
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

	return (
		<React.Fragment>
			<Group
				onClick={(e) => {
					if (e.evt.button === 0) {
						onSelected();
						e.cancelBubble = true;
					}
				}}
				ref={groupRef as any}
				draggable={isSelected}
				x={rectTransform.x}
				y={rectTransform.y}
				height={rectTransform.height}
				width={rectTransform.width}
				rotation={rectTransform.rotation}
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