import React, { useState, useEffect } from 'react';
import { Layer, Rect } from 'react-konva';

import { IScene, AssetType, AssetTypeToComponent } from '..';
import DraggableStage from './draggableStage';
import { useTheme } from 'sancho';
import ImageAsset, { IImageAsset } from './imageAsset';
import VideoAsset, { IVideoAsset } from './videoAsset';

type Props = { scene: IScene, onUpdate: (scene: IScene) => void };
const Canvas: React.SFC<Props> = ({ scene, onUpdate }) => {
	const theme = useTheme();

	const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

	function onDelete() {
		const assets = new Map(scene.assets.entries());
		assets.delete(selectedAsset!);
		onUpdate({
			...scene,
			assets
		});
		setSelectedAsset(null);
	}

	useEffect(() => {
		function onKeyPress(e: KeyboardEvent) {
			if ((e.key == 'Delete' || e.key == 'Backspace') && selectedAsset !== null) {
				onDelete();
			}
		}
		window.addEventListener('keyup', onKeyPress);
		return () => window.removeEventListener('keyup', onKeyPress);
	}, [selectedAsset])

	return (
		<DraggableStage onClick={() => setSelectedAsset(null)} draggable={selectedAsset == null}>
			<Layer>
				<Rect x={0} y={0} width={1920} height={1080} stroke="white" dash={[10, 10]} strokeWidth={5} listening={false} />
			</Layer>
			{
				Array.from(scene.assets.values())
					.map((asset) => {
						const Component = AssetTypeToComponent[asset.type];
						return (
							<Component
								key={asset.id}
								asset={asset as IImageAsset}
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
					})}
		</DraggableStage>
	);
}
export default Canvas;