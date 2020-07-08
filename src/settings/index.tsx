import useGlobalStorage from "../storage";
import React, { useState, SetStateAction, Dispatch } from "react";
import { IconButton, useTheme, IconSettings, Dialog, Tooltip, Text, InputGroup, Input } from "sancho";
import { css } from "emotion";

export enum Settings {
  DISPLAYED_SCENE = 'displayed_scene',
  TABLE_FREEZE = 'table_freeze',
  TABLE_RESOLUTION = 'table_resolution',
  TABLE_SIZE = 'table_size'
}

const storage = useGlobalStorage<unknown>('settings');
export function useSettingsDatabase() {
  return storage;
}

const { useOneValue: useOneSettingValue } = useSettingsDatabase();

type TableResolution = { width: number, height: number };
export function useTableResolution(): [TableResolution | undefined, Dispatch<SetStateAction<TableResolution>>] {
  const [tableResolution, setTableResolution] = useOneSettingValue<TableResolution>(Settings.TABLE_RESOLUTION);

  if (tableResolution === null) {
    return [
      { width: 1920, height: 1080 },
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

const ScreenSizeSettings: React.SFC = () => {
  const theme = useTheme();
  
  const [tableResolution, setTableResolution] = useTableResolution();
  const [tableSize, setTableSize] = useTableSize();

  const formItemMargin = css`margin: 0 ${theme.spaces.sm};`;
  
  if (tableResolution === undefined || tableSize === undefined) {
    return null;
  }

  return (
    <>
      <Text variant="h6">Table Display Settings</Text>
      <InputGroup label="Resolution">
        <div 
          className={css`
            display: flex; 
            align-items: center;
          `}
        >
          <Input
            type="number"
            min={1}
            placeholder="width"
            value={tableResolution.width}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (!isNaN(value)) {
                setTableResolution({ ...tableResolution, width: value })
              }
            }}
          />
          <div className={formItemMargin}>x</div>
          <Input
            type="number"
            min={1}
            placeholder="height"
            value={tableResolution.height}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (!isNaN(value)) {
                setTableResolution({ ...tableResolution, height: value })
              }
            }}
          />
        </div>
      </InputGroup>
      <InputGroup label="Screen Size">
        <div 
          className={css`
            display: flex; 
            align-items: center;
          `}
        >
          <Input
            type="number"
            min={1}
            value={tableSize}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (!isNaN(value)) {
                setTableSize(value)
              }
            }}
          />
          <div className={formItemMargin}>inches</div>
        </div>
      </InputGroup>
    </>
  );
}

const SettingsSidebarItem: React.SFC = () => {
  const theme = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Tooltip content="Settings" placement="right">
        <IconButton
          variant="ghost"
          color={theme.colors.text.muted}
          size="lg"
          icon={<IconSettings />}
          label="Settings"
          onClick={() => setDialogOpen(true)}
        />
      </Tooltip>
      <Dialog
        isOpen={dialogOpen}
        onRequestClose={() => setDialogOpen(false)}
        title="Settings"
      >
        <div className={css`padding: ${theme.spaces.lg};`}>
          <ScreenSizeSettings />
        </div>
      </Dialog>
    </>
  );
}
export default SettingsSidebarItem;