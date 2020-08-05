import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Layer } from 'react-konva';
import Konva from 'konva';
import { IconCloud, IconCloudOff, useTheme, IconTrash2, IconEye, IconEyeOff } from 'sancho';

import { ILayerComponentProps, ILayer } from '..';
import ToolbarPortal from '../toolbarPortal';
import ToolbarItem from '../toolbarItem';
import EditablePolygon, { IPolygon, PolygonType } from '../editablePolygon';
import { useTablePPI } from '../../../settings';
import { css } from 'emotion';
import { KonvaEventObject } from 'konva/types/Node';
import ToolbarSlider from '../toolbarSlider';

export interface IFogLayer extends ILayer {
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
      setSelectedPolygon(null);
      setAddingPolygon(null);
    }
  }, [active, setSelectedPolygon, setAddingPolygon])

  useEffect(() => {
    if (!layerRef.current?.parent || addingPolygon) return;
    const stage = layerRef.current.parent;

    function onParentClick(e: KonvaEventObject<MouseEvent>) {
      console.log(e.evt.button)
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
              visibleOnTable: true,
              opacity: 1,
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
              visibleOnTable: true,
              opacity: 1,
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
        <ToolbarSlider
          label="Opacity"
          value={selectedPolygon ? selectedPolygon.opacity : 1}
          disabled={!selectedPolygon}
          min={0}
          max={1}
          step={0.01}
          onChange={(e) => {
            if (!selectedPolygon) return;
            selectedPolygon!.opacity = +e.target.value;
            // TODO: Add debounce
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
    if (addingPolygon) {
      const collection = addingPolygon.type === PolygonType.FOG ? layer.fogPolygons : layer.fogClearPolygons;

      if (addingPolygon?.verticies && addingPolygon.verticies.length < 3) {
        console.log('removing polygon because < 3 verticies');
        const i = collection.indexOf(addingPolygon);
        collection.splice(i, 1);
      }

      setAddingPolygon(null);
      setSelectedPolygon(null);
      collection.push(addingPolygon);

      onUpdate({ ...layer });
    }
  }, [setAddingPolygon, layer, onUpdate, addingPolygon])

  const onPolygonUpdated = useCallback(() => {
    onUpdate({ ...layer });
  }, [onUpdate, layer])

  const getPolygonStyle = useCallback((poly: IPolygon) => {
    let opacity: number;
    if (isTable) {
      opacity = poly.opacity;
    } else {
      // set a range with a max of 0.6 and a min of 0.3
      opacity = 0.3 + 0.3 * poly.opacity
    }
    let fill = isTable ? 'black' : theme.colors.palette.gray.dark;

    if (poly.type === PolygonType.FOG_CLEAR) {
      if (isTable) {
        opacity = poly.opacity;
      } else {
        // set a range with a max of 0.6 and a min of 0.3
        opacity = (poly.visibleOnTable ? 0.15 : 0.3) + 0.3 * poly.opacity
      }
      fill = isTable ? 'black' : theme.colors.palette.gray.lightest;
    }

    return { opacity, fill };
  }, [isTable, theme])

  const allPolygons = [
    ...layer.fogPolygons.map((l) => { l.type = PolygonType.FOG; return l }),
    ...layer.fogClearPolygons.map((l) => { l.type = PolygonType.FOG_CLEAR; return l })
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

        const { opacity, fill } = getPolygonStyle(poly);

        const selected = selectedPolygon === poly;
        return (
          <EditablePolygon
            key={i}
            polygon={poly}

            opacity={opacity}
            fill={fill}
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

      {addingPolygon && (() => {
        const { opacity, fill } = getPolygonStyle(addingPolygon);

        return (
          <EditablePolygon
            key="adding"
            polygon={addingPolygon}

            opacity={opacity}
            fill={fill}

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