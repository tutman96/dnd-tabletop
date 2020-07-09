import useGlobalStorage from "../../storage";

const fileStorage = useGlobalStorage<File>('asset_file');
export function useAssetFileDatabase() {
	return fileStorage;
}