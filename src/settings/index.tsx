import React from "react";

import Box from '@mui/material/Box'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'

import globalStorage from "../storage";
import theme from "../theme";
import InputWithUnit from "../partials/inputWithUnit";
import InputGroup from "../partials/inputGroup";

export enum Settings {
  DISPLAYED_SCENE = 'displayed_scene',
  TABLE_FREEZE = 'table_freeze',
  TABLE_RESOLUTION = 'table_resolution',
  TABLE_SIZE = 'table_size',
  PLAY_AUDIO_ON_TABLE = 'play_audio_on_table'
}

const storage = globalStorage<unknown>('settings');
export function settingsDatabase() {
  return storage;
}

const { useOneValue: useOneSettingValue } = settingsDatabase();

type TableResolution = { width: number, height: number };
export function useTableResolution(): [TableResolution | undefined, (newValue: TableResolution) => Promise<void>] {
  const [tableResolution, setTableResolution] = useOneSettingValue<TableResolution>(Settings.TABLE_RESOLUTION);

  if (tableResolution === null) {
    return [
      { width: 3840, height: 2160 },
      setTableResolution
    ]
  }

  return [tableResolution, setTableResolution];
}

export function useTableSize(): [number | undefined, (newValue: number) => Promise<void>] {
  const [tableSize, setTableSize] = useOneSettingValue<number>(Settings.TABLE_SIZE);

  if (tableSize === null) {
    return [
      45,
      setTableSize
    ]
  }

  return [tableSize, setTableSize];
}

export function useTableDimensions() {
  const [size] = useTableSize();
  const [resolution] = useTableResolution();

  if (!resolution || !size) {
    return undefined;
  }

  const theta = Math.atan(resolution.height / resolution.width);
  const widthInch = size * Math.cos(theta);
  const heightInch = size * Math.sin(theta);

  return {
    width: widthInch,
    height: heightInch
  }
}

export function usePlayAudioOnTable(): [boolean | undefined, (newValue: boolean) => Promise<void>] {
  const [playAudio, setPlayAudio] = useOneSettingValue<boolean>(Settings.PLAY_AUDIO_ON_TABLE);
  if (playAudio === null) {
    return [
      false,
      setPlayAudio
    ]
  }
  return [playAudio, setPlayAudio];
}

export async function tablePPI() {
	let [resolution, size] = await Promise.all([
		storage.storage.getItem<{width:number, height: number}>(Settings.TABLE_RESOLUTION),
		storage.storage.getItem<number>(Settings.TABLE_SIZE)
	])

	if (!resolution || !size) {
		resolution = { width: 3840, height: 2160 };
	}
  if (!size) {
    size = 45;
  }

	const theta = Math.atan(resolution.height / resolution.width);
  const widthInch = size * Math.cos(theta);
  // const heightInch = tableSize * Math.sin(theta);

  const ppi = resolution.width / widthInch;
	return ppi;
}

export function useTablePPI(): number | null {
  const [resolution] = useTableResolution();
  const tableDimensions = useTableDimensions();

  if (!resolution || !tableDimensions) {
    return null;
  }

  const ppi = resolution.width / tableDimensions.width;
  return ppi;
}

const ScreenSizeSettings: React.FunctionComponent = () => {
  const [tableResolution, setTableResolution] = useTableResolution();
  const [tableSize, setTableSize] = useTableSize();
  const tablePPI = useTablePPI();
  const [playAudioOnTable, setPlayAudioOnTable] = usePlayAudioOnTable();

  if (tableResolution === undefined || tableSize === undefined || tablePPI === null) {
    return null;
  }

  return (
    <>
      <InputGroup header="Resolution">
        <InputWithUnit
          type="number"
          inputProps={{ min: 1 }}
          unit="px"
          fullWidth
          value={tableResolution.width}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (!isNaN(value)) {
              setTableResolution({ ...tableResolution, width: value })
            }
          }}
        />
        <Box sx={{ margin: theme.spacing(1) }}>x</Box>
        <InputWithUnit
          type="number"
          inputProps={{ min: 1 }}
          unit="px"
          fullWidth
          value={tableResolution.height}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (!isNaN(value)) {
              setTableResolution({ ...tableResolution, height: value })
            }
          }}
        />
      </InputGroup>
      <InputGroup header="Screen Size">
        <InputWithUnit
          type="number"
          inputProps={{ min: 1, max: 200, step: 0.1 }}
          unit="in"
          fullWidth
          value={tableSize}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (!isNaN(value) && value <= 200 && value > 1) {
              setTableSize(value)
            }
          }}
        />
      </InputGroup>
      <InputGroup header="Other Settings">
        <FormControlLabel
          control={
            <Switch
              checked={playAudioOnTable ?? true}
              disabled={playAudioOnTable === undefined}
              onChange={e => {
                setPlayAudioOnTable(e.target.checked);
              }}
            />
          }
          label="Play Audio on Table"
        />
      </InputGroup>
    </>
  );
}

const SettingsPanel: React.FunctionComponent = () => {

  return (
    <>
      <ScreenSizeSettings />
    </>
  );
}
export default SettingsPanel;