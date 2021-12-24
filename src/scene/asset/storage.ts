import globalStorage from "../../storage";

const fileStorage = globalStorage<File>('asset_file');
export function assetFileDatabase() {
	return fileStorage;
}