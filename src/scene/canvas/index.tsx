import React, { useState, useEffect } from 'react';
import { Layer, Rect, Line } from 'react-konva';

import { IScene, AssetTypeToComponent } from '..';
import DraggableStage from './draggableStage';
import { useTableResolution, useTablePPI } from '../../settings';
import { Vector2d } from 'konva/types/types';
import { useTheme } from 'sancho';

const TableViewOverlay: React.SFC<{ offset: Vector2d, rotation: number, showBorder: boolean, showGrid: boolean }> = ({ offset, rotation, showGrid, showBorder }) => {
	const theme = useTheme();
	const [tableResolution] = useTableResolution();
	const ppi = useTablePPI();

	if (!tableResolution || ppi === null) {
		return null;
	}

	const lines = new Array<{ start: Vector2d, end: Vector2d }>();

	if (showGrid) {
		for (let xOffset = 0; xOffset <= tableResolution.width; xOffset += ppi) {
			lines.push({
				start: {
					x: xOffset,
					y: 0
				},
				end: {
					x: xOffset,
					y: tableResolution.height
				}
			})
		}

		for (let yOffset = 0; yOffset <= tableResolution.height; yOffset += ppi) {
			lines.push({
				start: {
					x: 0,
					y: yOffset
				},
				end: {
					x: tableResolution.width,
					y: yOffset
				}
			})
		}
	}

	return (
		<Layer>
			{lines.map((line) => (
				<Line
					x={offset.x}
					y={offset.y}
					rotation={rotation}
					points={[line.start.x, line.start.y, line.end.x, line.end.y]}
					stroke={theme.colors.palette.gray.dark}
					dash={[1, 1]}
					strokeWidth={1}
				/>
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
					listening={false}
				/>
			}
		</Layer>
	)
}

type Props = { scene: IScene, onUpdate: (scene: IScene) => void };
const Canvas: React.SFC<Props> = ({ scene, onUpdate }) => {
	const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

	useEffect(() => {
		function onKeyPress(e: KeyboardEvent) {
			if ((e.key === 'Delete' || e.key === 'Backspace') && selectedAsset !== null) {
				const assets = new Map(scene.assets.entries());
				assets.delete(selectedAsset!);
				onUpdate({
					...scene,
					assets
				});
				setSelectedAsset(null);
			}
		}
		window.addEventListener('keyup', onKeyPress);
		return () => window.removeEventListener('keyup', onKeyPress);
	}, [scene, selectedAsset, onUpdate])

	return (
		<DraggableStage onClick={() => setSelectedAsset(null)} draggable={selectedAsset == null}>
			{
				Array.from(scene.assets.values())
					.map((asset) => {
						const Component = AssetTypeToComponent[asset.type];
						return (
							<Component
								key={asset.id}
								asset={asset}
								selected={selectedAsset === asset.id}
								onSelected={() => setSelectedAsset(asset.id)}
								onUpdate={(updatedAsset) => {
									const assets = new Map(scene.assets.entries());
									assets.set(updatedAsset.id, updatedAsset);
									onUpdate({
										...scene,
										assets
									});
								}}
							/>
						);
					})
			}
			<TableViewOverlay offset={{ x: 0, y: 0 }} rotation={0} showGrid={true} showBorder={true} />
		</DraggableStage>
	);
}
export default Canvas;