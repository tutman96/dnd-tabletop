import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Layer } from 'react-konva';
import Konva from 'konva';
import { IconCloud, IconCloudOff, useTheme, IconTrash2, IconEye, IconEyeOff, IconZapOff, IconZap } from 'sancho';
import { css } from 'emotion';
import { KonvaEventObject } from 'konva/types/Node';

import { ILayerComponentProps, ILayer } from '..';
import ToolbarPortal from '../toolbarPortal';
import ToolbarItem from '../toolbarItem';
import EditablePolygon, { IPolygon, PolygonType } from '../editablePolygon';
import { useTablePPI } from '../../../settings';
import RayCastRevealPolygon, { ILightSource } from './rayCastRevealPolygon';
import { LineConfig } from 'konva/types/shapes/Line';

const BLUR_RADIUS = 1 / 20;

export interface IFogLayer extends ILayer {
  lightSources: Array<ILightSource>;
  obstructionPolygons: Array<IPolygon>;
  fogPolygons: Array<IPolygon>;
  fogClearPolygons: Array<IPolygon>;
}

interface Props extends ILayerComponentProps<IFogLayer> { };
const FogLayer: React.SFC<Props> = ({ layer, isTable, onUpdate, active }) => {
  const theme = useTheme();
  const layerRef = useRef<Konva.Layer>();
  const tablePPI = useTablePPI();

  const [addingPolygon, setAddingPolygon] = useState<IPolygon | null>(null)
  const [selectedPolygon, setSelectedPolygon] = useState<IPolygon | null>(null)
  const [selectedLight, setSelectedLight] = useState<ILightSource | null>(null)

  const collections = {
    [PolygonType.FOG]: layer.fogPolygons,
    [PolygonType.FOG_CLEAR]: layer.fogClearPolygons,
    [PolygonType.LIGHT_OBSTRUCTION]: layer.obstructionPolygons
  };

  useEffect(() => {
    if (!active) {
      setSelectedPolygon(null);
      setAddingPolygon(null);
      setSelectedLight(null)
    }
  }, [active, setSelectedPolygon, setAddingPolygon, setSelectedLight])

  useEffect(() => {
    if (!layerRef.current?.parent || addingPolygon) return;
    const stage = layerRef.current.parent;

    function onParentClick(e: KonvaEventObject<MouseEvent>) {
      if (e.evt.button === 0) {
        setSelectedLight(null);
        setSelectedPolygon(null);
      }
    }
    stage.on('click', onParentClick);
    return () => { stage.off('click', onParentClick) }
  }, [layerRef, addingPolygon, setSelectedPolygon, setSelectedLight])

  const toolbar = useMemo(() => {
    return (
      <>
        <ToolbarItem
          label="Add Fog"
          icon={<IconCloud />}
          keyboardShortcuts={['a']}
          onClick={() => {
            const poly = {
              verticies: [],
              type: PolygonType.FOG,
              visibleOnTable: true
            } as IPolygon;
            setSelectedPolygon(poly);
            setAddingPolygon(poly);
            setSelectedLight(null);
          }}
        />
        <ToolbarItem
          label="Add Fog Clear"
          icon={<IconCloudOff />}
          keyboardShortcuts={['s']}
          onClick={() => {
            const poly = {
              verticies: [],
              type: PolygonType.FOG_CLEAR,
              visibleOnTable: true
            } as IPolygon;
            setSelectedPolygon(poly);
            setAddingPolygon(poly);
            setSelectedLight(null);
          }}
        />
        <ToolbarItem
          label="Add Light"
          icon={<IconZap />}
          onClick={() => {
            const light = {
              position: { x: 0, y: 0 }
            } as ILightSource;
            layer.lightSources.push(light);
            setSelectedLight(light);
            onUpdate({ ...layer });
          }}
          keyboardShortcuts={['e']}
        />
        <ToolbarItem
          label="Add Wall"
          icon={<IconZapOff />}
          onClick={() => {
            const poly = {
              verticies: [],
              type: PolygonType.LIGHT_OBSTRUCTION,
              visibleOnTable: true
            } as IPolygon;
            setSelectedPolygon(poly);
            setAddingPolygon(poly);
            setSelectedLight(null);
          }}
          keyboardShortcuts={['w']}
        />
        <ToolbarItem
          label={selectedPolygon && selectedPolygon.visibleOnTable ? 'Hide on Table' : 'Show on Table'}
          disabled={!selectedPolygon}
          icon={selectedPolygon && selectedPolygon.visibleOnTable ? <IconEye /> : <IconEyeOff />}
          keyboardShortcuts={['d']}
          onClick={() => {
            if (!selectedPolygon) return;
            selectedPolygon.visibleOnTable = !selectedPolygon.visibleOnTable;
            onUpdate({ ...layer })
          }}
        />
        <div className={css`flex-grow: 2;`} />
        <ToolbarItem
          icon={<IconTrash2 />}
          label="Delete"
          disabled={selectedPolygon === null && selectedLight === null}
          onClick={() => {
            if (selectedPolygon) {
              const collection = collections[selectedPolygon.type];

              const polygonIndex = collection.indexOf(selectedPolygon);
              if (polygonIndex !== -1) {
                collection.splice(polygonIndex, 1);
              }

              onUpdate({ ...layer });
              setSelectedPolygon(null);
            }
            else if (selectedLight) {
              const index = layer.lightSources.indexOf(selectedLight);
              if (index !== -1) {
                layer.lightSources.splice(index, 1);
              } 

              onUpdate({...layer});
              setSelectedLight(null);
            }
          }}
          keyboardShortcuts={['Delete', 'Backspace']}
        />
      </>
    );
  }, [selectedPolygon, selectedLight, layer, onUpdate, collections]);

  useEffect(() => {
    if (isTable && layerRef.current && tablePPI) {
      layerRef.current.canvas._canvas.className = css`
        filter: blur(${tablePPI * BLUR_RADIUS}px);
      `;
    }
  }, [layerRef, isTable, tablePPI]);

  const onPolygonAdded = useCallback(() => {
    if (addingPolygon) {
      const collection = collections[addingPolygon.type];

      if (addingPolygon.type !== PolygonType.LIGHT_OBSTRUCTION && addingPolygon?.verticies && addingPolygon.verticies.length < 3) {
        console.log('removing polygon because < 3 verticies');
        setAddingPolygon(null);
        setSelectedPolygon(null);
        return;
      }

      setAddingPolygon(null);
      setSelectedPolygon(null);
      collection.push(addingPolygon);

      onUpdate({ ...layer });
    }
  }, [setAddingPolygon, layer, onUpdate, addingPolygon, collections])

  const onPolygonUpdated = useCallback(() => {
    onUpdate({ ...layer });
  }, [onUpdate, layer])

  const getPolygonStyle = useCallback((poly: IPolygon): Partial<LineConfig> => {
    if (isTable) {
      switch (poly.type) {
        case PolygonType.FOG:
          return {
            fill: 'black',
            closed: true
          }
        case PolygonType.FOG_CLEAR:
          return {
            fill: 'black',
            globalCompositeOperation: "destination-out",
            closed: true
          };
        case PolygonType.LIGHT_OBSTRUCTION:
          return {
            closed: false
          }
      }
    }
    else {
      switch (poly.type) {
        case PolygonType.FOG:
          return {
            opacity: poly.visibleOnTable ? (active ? 0.6 : 0.4) : 0.3,
            fill: 'black',
            closed: true
          }
        case PolygonType.FOG_CLEAR:
          return {
            opacity: poly.visibleOnTable ? (active ? 0.3 : 1) : 0.6,
            fill: theme.colors.palette.gray.lightest,
            globalCompositeOperation: active ? undefined : "destination-out",
            stroke: theme.colors.palette.gray.lightest,
            strokeWidth: 5,
            strokeScaleEnabled: false,
            closed: true
          };
        case PolygonType.LIGHT_OBSTRUCTION:
          return {
            stroke: active ? (poly.visibleOnTable ? theme.colors.palette.violet.dark : theme.colors.palette.violet.lightest) : undefined,
            strokeWidth: active ? 10 : undefined,
            hitStrokeWidth: 20,
            strokeScaleEnabled: false,
            closed: false
          }
      }
    }
  }, [isTable, active, theme])

  const allPolygons = [
    ...layer.fogPolygons.map((l) => { l.type = PolygonType.FOG; return l }),
    ...layer.fogClearPolygons.map((l) => { l.type = PolygonType.FOG_CLEAR; return l }),
    ...layer.obstructionPolygons.map((l) => { l.type = PolygonType.LIGHT_OBSTRUCTION; return l }),
  ];

  return (
    <Layer
      ref={layerRef as any}
      listening={active}
      sceneFunc={console.log}
    >
      {active && <ToolbarPortal>{toolbar}</ToolbarPortal>}

      {allPolygons.map((poly, i) => {
        if (isTable && !poly.visibleOnTable) return null;

        const style = getPolygonStyle(poly);

        const selected = selectedPolygon === poly;
        return (
          <EditablePolygon
            key={i}
            polygon={poly}

            {...style}

            selectable={!addingPolygon}
            selected={selected}
            onSelected={() => {
              setSelectedPolygon(poly)
              setSelectedLight(null);
            }}

            adding={false}

            onUpdate={onPolygonUpdated}
          />
        )
      })}

      {layer.lightSources.map((light, i) => (
        <RayCastRevealPolygon
          key={`rcr${i}`}
          light={light}
          displayIcon={!isTable}
          isTable={isTable}
          obstructionPolygons={layer.obstructionPolygons}
          onUpdate={(light) => {
            layer.lightSources[i] = light;
            onUpdate({ ...layer });
          }}
          selected={selectedLight === light}
          onSelected={() => {
            setSelectedLight(light)
            setSelectedPolygon(null);
          }}
        />
      ))}

      {addingPolygon && (() => {
        const style = getPolygonStyle(addingPolygon);

        return (
          <EditablePolygon
            key="adding"
            polygon={addingPolygon}

            {...style}

            selectable={false}
            selected={true}

            adding={true}
            onAdded={onPolygonAdded}

            onUpdate={onPolygonUpdated}
          />
        );
      })()}
    </Layer>
  );
}
export default FogLayer;