import React, { SetStateAction, Dispatch } from "react";

import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Input from '@mui/material/Input'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'

import globalStorage from "../storage";
import theme from "../theme";
import InputWithUnit from "../partials/inputWithUnit";


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
export function useTableResolution(): [TableResolution | undefined, Dispatch<SetStateAction<TableResolution>>] {
  const [tableResolution, setTableResolution] = useOneSettingValue<TableResolution>(Settings.TABLE_RESOLUTION);

  if (tableResolution === null) {
    return [
      { width: 3840, height: 2160 },
      setTableResolution
    ]
  }

  return [tableResolution, setTableResolution];
}

export function useTableSize(): [number | undefined, Dispatch<SetStateAction<number>>] {
  const [tableSize, setTableSize] = useOneSettingValue<number>(Settings.TABLE_SIZE);

  if (tableSize === null) {
    return [
      45,
      setTableSize
    ]
  }

  return [tableSize, setTableSize];
}

export function usePlayAudioOnTable(): [boolean | undefined, Dispatch<SetStateAction<boolean>>] {
  const [playAudio, setPlayAudio] = useOneSettingValue<boolean>(Settings.PLAY_AUDIO_ON_TABLE);
  if (playAudio === null) {
    return [
      false,
      setPlayAudio
    ]
  }
  return [playAudio, setPlayAudio];
}

export function useTablePPI(): number | null {
  const [tableResolution] = useTableResolution();
  const [tableSize] = useTableSize();
  if (!tableResolution || !tableSize) {
    return null;
  }

  const theta = Math.atan(tableResolution.height / tableResolution.width);
  const widthInch = tableSize * Math.cos(theta);
  // const heightInch = tableSize * Math.sin(theta);

  const ppi = tableResolution.width / widthInch;
  return ppi;
}

const SettingGroup: React.FunctionComponent<{ header: string }> = ({ header, children }) => {
  return (
    <>
      <Typography variant="overline">{header}</Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: theme.spacing(1),
        }}
      >
        {children}
      </Box>
    </>
  );
}

const ScreenSizeSettings: React.FunctionComponent = () => {
  const [tableResolution, setTableResolution] = useTableResolution();
  const [tableSize, setTableSize] = useTableSize();
  const [playAudioOnTable, setPlayAudioOnTable] = usePlayAudioOnTable();

  if (tableResolution === undefined || tableSize === undefined) {
    return null;
  }

  return (
    <>
      <SettingGroup header="Resolution">
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
      </SettingGroup>
      <SettingGroup header="Screen Size">
        <InputWithUnit
          type="number"
          inputProps={{ min: 1, max: 200 }}
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
      </SettingGroup>
      <SettingGroup header="Other Settings">
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
      </SettingGroup>
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