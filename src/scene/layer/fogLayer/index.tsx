import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Layer } from 'react-konva';
import { Vector2d } from 'konva/types/types';
import Konva from 'konva';
import { IconCloud, IconCloudOff, useTheme, IconTrash2, IconEye, IconEyeOff } from 'sancho';

import { ILayerComponentProps, ILayer } from '..';
import ToolbarPortal from '../toolbarPortal';
import { IPolygon } from './rayCaster';
import ToolbarItem from '../toolbarItem';
import EditablePolygon from './editablePolygon';
import { useTablePPI } from '../../../settings';
import { css } from 'emotion';

export interface ILightSource {
  position: Vector2d
}

export interface IFogLayer extends ILayer {
  obstructionPolygons: Array<IPolygon>;
  lightSources: Array<ILightSource>;
  fogPolygons: Array<IPolygon>;
  fogClearPolygons: Array<IPolygon>;
}

interface Props extends ILayerComponentProps<IFogLayer> { };
const FogLayer: React.SFC<Props> = ({ layer, isTable, onUpdate, active }) => {
  const theme = useTheme();
  const layerRef = useRef<Konva.Layer>();
  const tablePPI = useTablePPI();

  const [localLayer, setLocalLayer] = useState(layer);
  const [addingPolygon, setAddingPolygon] = useState<IPolygon | null>(null)
  const [selectedPolygon, setSelectedPolygon] = useState<IPolygon | null>(null)

  const setLocalLayerThrottled = useCallback((value: IFogLayer) => {
    const timer = requestAnimationFrame(() => setLocalLayer(value));
    return () => cancelAnimationFrame(timer);
  }, [setLocalLayer])

  useEffect(() => {
    setLocalLayerThrottled(layer);
  }, [layer, setLocalLayerThrottled])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (layer !== localLayer) {
        onUpdate(localLayer);
      }
    }, 100)
    return () => clearTimeout(timeout);
  }, [localLayer, layer, onUpdate])

  useEffect(() => {
    setSelectedPolygon(null);
    setAddingPolygon(null);
  }, [active, setSelectedPolygon, setAddingPolygon])

  useEffect(() => {
    if (!layerRef.current?.parent || addingPolygon) return;
    const stage = layerRef.current.parent;

    function onParentClick() {
      setSelectedPolygon(null);
    }
    stage.on('click.konva', onParentClick);
    return () => { stage.off('click.konva', onParentClick) }
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
              visibleOnTable: true
            } as IPolygon;
            localLayer.fogPolygons.push(poly)
            setSelectedPolygon(poly);
            setAddingPolygon(poly);
            setLocalLayerThrottled(localLayer);
          }}
        />
        <ToolbarItem
          label="Add Fog Clear"
          icon={<IconCloudOff />}
          keyboardShortcuts={['s']}
          onClick={() => {
            const poly = {
              verticies: [],
              visibleOnTable: true
            } as IPolygon;
            localLayer.fogClearPolygons.push(poly)
            setSelectedPolygon(poly);
            setAddingPolygon(poly);
            setLocalLayerThrottled(localLayer);
          }}
        />
        <ToolbarItem
          label="Add Fog Clear"
          disabled={!selectedPolygon}
          icon={selectedPolygon && selectedPolygon.visibleOnTable ? <IconEye /> : <IconEyeOff />}
          keyboardShortcuts={['d']}
          onClick={() => {
            if (!selectedPolygon) return;
            selectedPolygon.visibleOnTable = !selectedPolygon.visibleOnTable;
            setLocalLayer({ ...localLayer })
          }}
        />
        <div className={css`flex-grow: 2;`} />
        <ToolbarItem
          icon={<IconTrash2 />}
          label="Delete Asset"
          disabled={selectedPolygon === null}
          onClick={() => {
            if (!selectedPolygon) return;

            const fogPolygonIndex = localLayer.fogPolygons.indexOf(selectedPolygon);
            if (fogPolygonIndex !== -1) {
              localLayer.fogPolygons.splice(fogPolygonIndex, 1);
              localLayer.fogPolygons = [...localLayer.fogPolygons];
            }

            const fogClearPolygonIndex = localLayer.fogClearPolygons.indexOf(selectedPolygon);
            if (fogClearPolygonIndex !== -1) {
              localLayer.fogClearPolygons.splice(fogClearPolygonIndex, 1);
              localLayer.fogClearPolygons = [...localLayer.fogClearPolygons];
            }

            setLocalLayer({ ...localLayer })
            setSelectedPolygon(null);
          }}
          keyboardShortcuts={['Delete', 'Backspace']}
        />
      </>
    );
  }, [selectedPolygon, localLayer, setLocalLayerThrottled]);

  useEffect(() => {
    if (isTable) {
      if (layerRef.current) {
        console.time('batchDraw');
        layerRef.current!.getLayer().batchDraw();
        layerRef.current.cache({ pixelRatio: Math.min(tablePPI ? 0.002 * tablePPI : 0.1, 0.4), imageSmoothingEnabled: false });
        console.timeEnd('batchDraw');
      }
    }
  }, [layerRef, isTable, localLayer, tablePPI]);

  return (
    <Layer
      ref={layerRef as any}
      listening={active}
      filters={isTable ? [Konva.Filters.Blur] : undefined}
      blurRadius={isTable ? 2 : undefined}
      sceneFunc={console.log}
    >
      {active && <ToolbarPortal>{toolbar}</ToolbarPortal>}

      {localLayer.fogPolygons.map((fogPoly, i) => {
        const selected = selectedPolygon === fogPoly;
        const adding = addingPolygon === fogPoly;
        if (isTable && !fogPoly.visibleOnTable) return null;
        return (
          <EditablePolygon
            key={`f${i}`}
            polygon={fogPoly}

            opacity={isTable ? 1 : 0.6}
            fill={isTable ? 'black' : theme.colors.palette.gray.dark}

            selectable={!addingPolygon}
            selected={selected}
            onSelected={() => {
              setSelectedPolygon(fogPoly);
            }}

            adding={adding}
            onAdded={() => {
              if (addingPolygon?.verticies && addingPolygon.verticies.length < 3) {
                const i = localLayer.fogPolygons.indexOf(addingPolygon);
                localLayer.fogPolygons.splice(i, 1);
              }
              setAddingPolygon(null);
              setSelectedPolygon(null);
              onUpdate({ ...localLayer })
            }}

            onUpdate={(newPoly) => {
              localLayer.fogPolygons[i] = newPoly;
              setLocalLayerThrottled({ ...localLayer });
            }}
          />
        )
      })}

      {localLayer.fogClearPolygons?.map((fogPoly, i) => {
        const selected = selectedPolygon === fogPoly;
        const adding = addingPolygon === fogPoly;
        if (isTable && !fogPoly.visibleOnTable) return null;
        return (
          <EditablePolygon
            key={`cf${i}`}
            polygon={fogPoly}

            opacity={isTable ? 1 : (fogPoly.visibleOnTable ? 0.3 : 0.6)}
            fill={isTable ? 'black' : theme.colors.palette.gray.lightest}
            globalCompositeOperation={isTable ? "destination-out" : 'source-over'}

            selectable={!addingPolygon}
            selected={selected}
            onSelected={() => {
              setSelectedPolygon(fogPoly);
            }}

            adding={adding}
            onAdded={() => {
              if (addingPolygon?.verticies && addingPolygon.verticies.length < 3) {
                const i = localLayer.fogClearPolygons.indexOf(addingPolygon);
                localLayer.fogClearPolygons.splice(i, 1);
              }
              setAddingPolygon(null);
              setSelectedPolygon(null);
              setLocalLayer({ ...localLayer })
            }}

            onUpdate={(newPoly) => {
              localLayer.fogClearPolygons[i] = newPoly;
              setLocalLayerThrottled({ ...localLayer });
            }}
          />
        )
      })}
    </Layer>
  );
}
export default FogLayer;