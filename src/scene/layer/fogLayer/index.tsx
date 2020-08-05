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

  const collections = {
    [PolygonType.FOG]: layer.fogPolygons,
    [PolygonType.FOG_CLEAR]: layer.fogClearPolygons,
    [PolygonType.LIGHT_OBSTRUCTION]: layer.obstructionPolygons
  };

  useEffect(() => {
    if (!active) {
      setSelectedPolygon(null);
      setAddingPolygon(null);
    }
  }, [active, setSelectedPolygon, setAddingPolygon])

  useEffect(() => {
    if (!layerRef.current?.parent || addingPolygon) return;
    const stage = layerRef.current.parent;

    function onParentClick(e: KonvaEventObject<MouseEvent>) {
      if (e.evt.button === 0) {
        setSelectedPolygon(null);
      }
    }
    stage.on('click', onParentClick);
    return () => { stage.off('click', onParentClick) }
  }, [layerRef, addingPolygon, setSelectedPolygon])

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
            onUpdate({ ...layer });
          }}
        />
        <ToolbarItem
          label="Add Light Obstruction"
          icon={<IconZapOff />}
          onClick={() => {
            const poly = {
              verticies: [],
              type: PolygonType.LIGHT_OBSTRUCTION,
              visibleOnTable: true
            } as IPolygon;
            setSelectedPolygon(poly);
            setAddingPolygon(poly);
          }}
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
          label="Delete Asset"
          disabled={selectedPolygon === null}
          onClick={() => {
            if (!selectedPolygon) return;
            const collection = collections[selectedPolygon.type];

            const fogPolygonIndex = collection.indexOf(selectedPolygon);
            if (fogPolygonIndex !== -1) {
              collection.splice(fogPolygonIndex, 1);
            }

            onUpdate({ ...layer })
            setSelectedPolygon(null);
          }}
          keyboardShortcuts={['Delete', 'Backspace']}
        />
      </>
    );
  }, [selectedPolygon, layer, onUpdate, collections]);

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
    switch (poly.type) {
      case PolygonType.FOG:
        return {
          opacity: isTable ? 1 : 0.6,
          fill: isTable ? 'black' : theme.colors.palette.gray.dark,
          closed: true
        }
      case PolygonType.FOG_CLEAR:
        return {
          opacity: isTable ? 1 : (poly.visibleOnTable ? 0.3 : 0.6),
          fill: isTable ? 'black' : theme.colors.palette.gray.lightest,
          closed: true
        };
      case PolygonType.LIGHT_OBSTRUCTION:
        return {
          opacity: 1,
          stroke: isTable ? undefined : poly.visibleOnTable ? theme.colors.palette.violet.dark : theme.colors.palette.violet.lightest,
          strokeWidth: isTable ? undefined : 5,
          strokeScaleEnabled: false,
          closed: false
        }
    }
  }, [isTable, theme])

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
            globalCompositeOperation={
              poly.type === PolygonType.FOG_CLEAR ?
                (isTable ? "destination-out" : 'source-over') :
                undefined
            }

            selectable={!addingPolygon}
            selected={selected}
            onSelected={() => setSelectedPolygon(poly)}

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