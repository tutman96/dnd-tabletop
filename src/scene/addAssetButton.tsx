import React from "react";
import { IconButton, IconFilePlus } from "sancho";

import { IScene } from ".";
import { getNewAssets } from "./asset";

type Props = { scene: IScene, onUpdate: (scene: IScene) => void };
const AddAssetButton: React.SFC<Props> = ({ scene, onUpdate }) => {
	return (
		<IconButton
			icon={<IconFilePlus />}
			variant="ghost"
			label="Add Asset"
			onClick={async () => {
				const assets = await getNewAssets();
				for (const asset of assets) {
					scene.assets.set(asset.id, asset);
				}
				onUpdate({ ...scene })
			}}
		/>
	);
}
export default AddAssetButton;