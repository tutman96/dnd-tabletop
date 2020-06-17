import React from "react";
import { List, ListItem, Text, Skeleton, Input, useTheme, IconButton, IconPlusCircle, Button, IconPlus, IconFilm, Layer } from "sancho";
import { css } from "emotion";


import { IScene, useSceneDatabase, createNewScene } from ".";

const { useAllValues, createItem } = useSceneDatabase()

const Tile: React.SFC<{ children: React.ReactElement, className?: string, onClick?: () => void }> = (props) => {
	const theme = useTheme();
	return (
		<Layer
			elevation="sm"
			className={(props.className ? `${props.className} ` : '') + css`
				width: 175px;
				height: 100px;
				background-color: ${theme.colors.background.tint1};
				padding: ${theme.spaces.lg};
				/* box-shadow: ${theme.shadows.xs}; */
				:hover {
					background-color: ${theme.colors.background.tint2};
					box-shadow: ${theme.shadows.md};
					cursor: pointer;
				}
			`}
			{...props}
		/>
	);
}

function LoadingScenes() {
	return <List><ListItem primary={<Skeleton animated />} /></List>
}

function NoScenes(props: { onAdd: () => void }) {
	const theme = useTheme();

	return (
		<div
			className={css`
				display: flex;
				align-items: center;
				justify-content: center;
				height: 100%;
			`}
		>
			<div
				className={css`
					display: flex;
					flex-direction: column;
					align-items: center;
				`}
			>
				<IconFilm size="xl" color="#BDBEBF" />
				<Button iconBefore={<IconPlus />} variant="ghost" color={theme.colors.text.muted} onClick={props.onAdd}>Add a scene</Button>
			</div>
		</div>
	)
}

type Props = { onSceneSelect: (scene: IScene) => any };
const SceneTiles: React.SFC<Props> = ({ onSceneSelect }) => {
	const theme = useTheme();

	const allValues = useAllValues();

	function addNewScene() {
		const scene = createNewScene();
		createItem(scene.id, scene);
		onSceneSelect(scene);
	}

	return (
		<div
			className={css`
				padding: ${theme.spaces.md};
				display: flex;
				flex-direction: column;
				height: 100vh;
			`}
		>
			<div
				className={css`
					display: flex;
					flex-direction: row;
					align-items: center;
					margin-bottom: ${theme.spaces.md};
				`}
			>
				<Text
					variant="h4"
					className={css`
						text-align: left;
						padding-top: ${theme.spaces.md};
						flex-grow: 1;
					`}
				>
					Scenes
				</Text>
				<Input
					type="search"
					placeholder="Find a scene..."
					className={css`
						width: 30%;
						max-width: 250px;
					`}
				/>
				<IconButton icon={<IconPlusCircle />} label="Add Scene" variant="ghost" onClick={addNewScene} />
			</div>
			{allValues && allValues.size === 0 && <NoScenes onAdd={addNewScene} />}
			<div
				className={css`
					display: flex;
					flex-direction: row;
					flex-wrap: wrap;
					justify-content: space-between;
					flex-grow: 1;
					overflow: auto;
				`}
			>
				{allValues && Array.from(allValues.values()).map((scene) => (
					<Tile onClick={() => onSceneSelect(scene)} key={scene.id}>
						<Text>{scene.name}</Text>
					</Tile>
				))}
			</div>
		</div>
	);
};
export default SceneTiles;