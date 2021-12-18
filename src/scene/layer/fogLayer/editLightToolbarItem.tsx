import React, { useState, useEffect } from 'react';
import { ILightSource } from './rayCastRevealPolygon';
import ToolbarItem from '../toolbarItem';
import { IconSliders, Dialog, useTheme, Button, Text, Input, InputGroup } from 'sancho';
import { css } from 'emotion';

const DEFAULT_LIGHT_SOURCES = [
  {
    name: 'Torch / Light Spell',
    brightLightDistance: 20 / 5,
    dimLightDistance: 40 / 5
  },
  {
    name: 'Lantern',
    brightLightDistance: 30 / 5,
    dimLightDistance: 60 / 5
  },
  {
    name: 'Produce Flame Spell',
    brightLightDistance: 10 / 5,
    dimLightDistance: 20 / 5
  },
  {
    name: 'Dancing Lights Spell',
    brightLightDistance: 0 / 5,
    dimLightDistance: 10 / 5
  },
  {
    name: 'Daylight Spell',
    brightLightDistance: 60 / 5,
    dimLightDistance: 120 / 5
  },
] as Array<Partial<ILightSource> & { name: string }>;

type NumberPropertiesNames<T> = { [K in keyof T]: T[K] extends number ? K : never; }[keyof T]
type NumberProperties<T> = Pick<T, NumberPropertiesNames<T>>;

type Props = { light: ILightSource | null, onUpdate: (light: ILightSource) => void };
const EditLightToolbarItem: React.SFC<Props> = ({ light, onUpdate }) => {
  const theme = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [localLight, setLocalLight] = useState<ILightSource | null>(light);

  useEffect(() => {
    setLocalLight(light);
  }, [light, setLocalLight]);

  function updateNumberParameter(key: string, e: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(e.target.value);
    if (!isNaN(value)) {
      setLocalLight({
        ...localLight!,
        [key]: value / 5
      })
    }
  }

  return (
    <>
      <ToolbarItem
        icon={<IconSliders />}
        label="Configure"
        keyboardShortcuts={['r']}
        disabled={!light}
        onClick={() => setShowModal(true)}
      />
      {localLight && (
        <Dialog
          isOpen={showModal}
          onRequestClose={() => setShowModal(false)}
          title="Configure Light"
        >
          <div className={css`padding: ${theme.spaces.lg};`}>
            <Text variant="lead">Predefined Lights</Text>
            <div
              className={css`
                padding: ${theme.spaces.md} 0;
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
              `}
            >
              {DEFAULT_LIGHT_SOURCES.map((lightSource) => (
                <Button
                  key={lightSource.name}
                  variant="outline"
                  size="sm"
                  className={css`
                    margin: 0 ${theme.spaces.sm} ${theme.spaces.sm} 0;
                  `}
                  intent={
                    lightSource.brightLightDistance === localLight.brightLightDistance &&
                      lightSource.dimLightDistance === localLight.dimLightDistance ?
                      'primary' :
                      'none'
                  }
                  onClick={() => {
                    setLocalLight({
                      ...localLight,
                      brightLightDistance: lightSource.brightLightDistance,
                      dimLightDistance: lightSource.dimLightDistance
                    });
                  }}
                >
                  {lightSource.name}
                </Button>
              ))}
            </div>

            <Text variant="lead">Parameters</Text>
            <InputGroup label="Bright Light Distance (ft)">
              <Input type="number" value={localLight.brightLightDistance! * 5 + ""} onChange={e => updateNumberParameter('brightLightDistance', e)} min={0} />
            </InputGroup>
            <InputGroup label="Dim Light Distance (ft)">
              <Input type="number" value={localLight.dimLightDistance! * 5 + ""} onChange={e => updateNumberParameter('dimLightDistance', e)} min={0} />
            </InputGroup>

            <div
              className={css`
                display: flex;
                margin-top: ${theme.spaces.lg};
                justify-content: flex-end;
              `}
            >
              <Button variant="ghost" intent="primary" onClick={() => {
                onUpdate({ ...localLight });
                setShowModal(false);
              }}>
                Save
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}
export default EditLightToolbarItem;