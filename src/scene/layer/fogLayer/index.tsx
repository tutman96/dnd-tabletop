import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Layer } from 'react-konva';
import { Vector2d } from 'konva/types/types';
import Konva from 'konva';
import { IconCloud, IconCloudOff, useTheme, IconTrash2, IconEye, IconEyeOff } from 'sancho';

import { ILayerComponentProps, ILayer } from '..';
import ToolbarPortal from '../toolbarPortal';
import ToolbarItem from '../toolbarItem';
import EditablePolygon, { IPolygon, PolygonType } from './editablePolygon';
import { useTablePPI } from '../../../settings';
import { css } from 'emotion';
import { useKeyPress } from '../../../utils';

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

  const [addingPolygon, setAddingPolygon] = useState<IPolygon | null>(null)
  const [selectedPolygon, setSelectedPolygon] = useState<IPolygon | null>(null)

  useEffect(() => {
    if (!active) {
      console.log('not active');
      setSelectedPolygon(null);
      setAddingPolygon(null);
    }
  }, [active, setSelectedPolygon, setAddingPolygon])

  useEffect(() => {
    if (!layerRef.current?.parent || addingPolygon) return;
    const stage = layerRef.current.parent;

    function onParentClick() {
      console.log('parent clicked');
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
              type: PolygonType.FOG,
              visibleOnTable: true
            } as IPolygon;
            layer.fogPolygons.push(poly)
            setSelectedPolygon(poly);
            setAddingPolygon(poly);
            onUpdate(layer);
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
            layer.fogClearPolygons.push(poly)
            setSelectedPolygon(poly);
            setAddingPolygon(poly);
            onUpdate(layer);
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

            const fogPolygonIndex = layer.fogPolygons.indexOf(selectedPolygon);
            if (fogPolygonIndex !== -1) {
              layer.fogPolygons.splice(fogPolygonIndex, 1);
              layer.fogPolygons = [...layer.fogPolygons];
            }

            const fogClearPolygonIndex = layer.fogClearPolygons.indexOf(selectedPolygon);
            if (fogClearPolygonIndex !== -1) {
              layer.fogClearPolygons.splice(fogClearPolygonIndex, 1);
              layer.fogClearPolygons = [...layer.fogClearPolygons];
            }

            onUpdate({ ...layer })
            setSelectedPolygon(null);
          }}
          keyboardShortcuts={['Delete', 'Backspace']}
        />
      </>
    );
  }, [selectedPolygon, layer, onUpdate]);

  useEffect(() => {
    if (isTable && layerRef.current && tablePPI) {
      layerRef.current.canvas._canvas.className = css`
        filter: blur(${tablePPI / 10}px);
      `;
    }
  }, [layerRef, isTable, tablePPI]);

  const onPolygonAdded = useCallback(() => {
    console.log('editablePolygon onAdded');
    if (addingPolygon?.verticies && addingPolygon.verticies.length < 3) {
      console.log('removing polygon because < 3 verticies');
      const collection = addingPolygon.type === PolygonType.FOG ? layer.fogPolygons : layer.fogClearPolygons;
      const i = collection.indexOf(addingPolygon);
      collection.splice(i, 1);
    }
    
    setAddingPolygon(null);
    setSelectedPolygon(null);
    onUpdate({ ...layer });
  }, [setAddingPolygon, layer, onUpdate, addingPolygon])

  const isEscapePressed = useKeyPress('Escape');
  const isEnterPressed = useKeyPress('Enter');
  const shouldEndAdd = isEnterPressed || isEscapePressed;
  useEffect(() => {
    if (addingPolygon && shouldEndAdd) {
      onPolygonAdded();
    }
  }, [addingPolygon, shouldEndAdd, onPolygonAdded])

  const onPolygonUpdated = useCallback(() => {
    onUpdate({ ...layer });
  }, [onUpdate, layer])

  return (
    <Layer
      ref={layerRef as any}
      listening={active}
      sceneFunc={console.log}
    >
      {active && <ToolbarPortal>{toolbar}</ToolbarPortal>}

      {layer.fogPolygons.map((fogPoly, i) => {
        fogPoly.type = PolygonType.FOG;
        if (isTable && !fogPoly.visibleOnTable) return null;

        const selected = selectedPolygon === fogPoly;
        const adding = addingPolygon === fogPoly;
        return (
          <EditablePolygon
            key={`f${i}`}
            polygon={fogPoly}

            opacity={isTable ? 1 : 0.6}
            fill={isTable ? 'black' : theme.colors.palette.gray.dark}

            selectable={!addingPolygon}
            selected={selected}
            onSelected={() => setSelectedPolygon(fogPoly)}

            adding={adding}

            onUpdate={onPolygonUpdated}
          />
        )
      })}

      {layer.fogClearPolygons?.map((fogPoly, i) => {
        fogPoly.type = PolygonType.FOG_CLEAR;
        if (isTable && !fogPoly.visibleOnTable) return null;

        const selected = selectedPolygon === fogPoly;
        const adding = addingPolygon === fogPoly;

        return (
          <EditablePolygon
            key={`cf${i}`}
            polygon={fogPoly}

            opacity={isTable ? 1 : (fogPoly.visibleOnTable ? 0.3 : 0.6)}
            fill={isTable ? 'black' : theme.colors.palette.gray.lightest}
            globalCompositeOperation={isTable ? "destination-out" : 'source-over'}

            selectable={!addingPolygon}
            selected={selected}
            onSelected={() => setSelectedPolygon(fogPoly)}

            adding={adding}

            onUpdate={onPolygonUpdated}
          />
        )
      })}
    </Layer>
  );
}
export default FogLayer;