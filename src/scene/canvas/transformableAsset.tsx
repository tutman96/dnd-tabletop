import React, { useRef, useEffect } from 'react';
import { Group, Transformer } from 'react-konva';
import Konva from 'konva';

import theme from '../../theme';
import * as Types from '../../protos/scene';

type Props = {
	rectTransform: Types.AssetLayer_Asset_AssetTransform,
	onTransform: (newRect: Types.AssetLayer_Asset_AssetTransform) => void,
	isSelected: boolean,
	onSelected: () => void,
	snapOffset?: { x: number, y: number },
	scaleEnabled?: boolean;
	skewEnabled?: boolean;
	rotateEnabled?: boolean;
	strokeEnabled?: boolean;
};
const TransformableAsset: React.FunctionComponent<Props> = ({
	rectTransform, onTransform,
	isSelected, onSelected,
	snapOffset,
	children,
	rotateEnabled, scaleEnabled, skewEnabled, strokeEnabled
}) => {
	const groupRef = useRef<Konva.Group>();
	const trRef = useRef<Konva.Transformer>();

	useEffect(() => {
		if (isSelected) {
			// we need to attach transformer manually
			trRef.current?.setNodes([groupRef.current!]);
			trRef.current?.getLayer()?.batchDraw();
		}
	}, [isSelected]);

	return (
		<React.Fragment>
			<Group
				ref={groupRef as any}
				onMouseDown={(e) => {
					if (e.evt.button === 0 && isSelected) {
						groupRef.current?.startDrag(e);
						e.cancelBubble = true;
					}
				}}	
				x={rectTransform.x}
				y={rectTransform.y}
				height={rectTransform.height}
				width={rectTransform.width}
				rotation={rectTransform.rotation}
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
					const rotation = Math.round(node.rotation() * 100) / 100;

					let x = e.target.x();
					let y = e.target.y();

					if (snapOffset && rotation % 90 === 0) {
						const xOffset = snapOffset.x;
						const yOffset = snapOffset.y;
						x = Math.round((x + xOffset)) - xOffset;
						y = Math.round((y + yOffset)) - yOffset;

						e.target.x(x);
						e.target.y(y);
					}

					onTransform({
						x,
						y,
						rotation,
						width: node.width() * scaleX,
						height: node.height() * scaleY
					});
				}}
				onTransformEnd={() => {
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
					ignoreStroke={true}
					anchorFill={theme.palette.primary.contrastText}
					anchorStroke={theme.palette.primary.dark}
					rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
					rotateAnchorOffset={20}
				/>
			)}
		</React.Fragment>
	);
}
export default TransformableAsset;