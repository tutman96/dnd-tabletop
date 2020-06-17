import useGlobalStorage from "../storage";

export enum Settings {
	DISPLAYED_SCENE = 'displayed_scene',
	TABLE_FREEZE = 'table_freeze'
}

const storage = useGlobalStorage<unknown>('settings');
export function useSettingsDatabase() {
	return storage;
}
