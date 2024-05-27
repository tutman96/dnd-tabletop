import React, {useMemo, useState, useEffect, useRef, useCallback} from 'react';
import {Layer} from 'react-konva';
import Konva from 'konva';

import {deepPurple} from '@mui/material/colors';

import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import CloudOffOutlinedIcon from '@mui/icons-material/CloudOffOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import CastleOutlinedIcon from '@mui/icons-material/CastleOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

import {ILayerComponentProps} from '..';
import ToolbarPortal from '../toolbarPortal';
import ToolbarItem, {ToolbarSeparator} from '../toolbarItem';
import EditablePolygon from './editablePolygon';
import {useTablePPI} from '../../../settings';
import RayCastRevealPolygon, {defaultLightSource} from './rayCastRevealPolygon';
import {calculateViewportCenter} from '../../canvas';
import EditLightToolbarItem from './editLightToolbarItem';
import * as Types from '../../../protos/scene';

export const BLUR_RADIUS = 1 / 20;

type Props = ILayerComponentProps<Types.FogLayer>;
const FogLayer: React.FunctionComponent<Props> = ({
  layer,
  isTable,
  onUpdate,
  active,
}) => {
  const layerRef = useRef<Konva.Layer>();
  const tablePPI = useTablePPI();

  const [addingPolygon, setAddingPolygon] =
    useState<Types.FogLayer_Polygon | null>(null);
  const [selectedPolygon, setSelectedPolygon] =
    useState<Types.FogLayer_Polygon | null>(null);
  const [selectedLight, setSelectedLight] =
    useState<Types.FogLayer_LightSource | null>(null);

  const collections = useMemo(
    () => ({
      [Types.FogLayer_Polygon_PolygonType.FOG]: layer.fogPolygons,
      [Types.FogLayer_Polygon_PolygonType.FOG_CLEAR]: layer.fogClearPolygons,
      [Types.FogLayer_Polygon_PolygonType.LIGHT_OBSTRUCTION]:
        layer.obstructionPolygons,
    }),
    [layer]
  );

  useEffect(() => {
    if (!active) {
      setSelectedPolygon(null);
      setAddingPolygon(null);
      setSelectedLight(null);
    }
  }, [active, setSelectedPolygon, setAddingPolygon, setSelectedLight]);

  useEffect(() => {
    if (!layerRef.current?.parent || addingPolygon) return;
    const stage = layerRef.current.parent;

    function onParentClick(e: Konva.KonvaEventObject<MouseEvent>) {
      if (e.evt.button === 0) {
        setSelectedLight(null);
        setSelectedPolygon(null);
      }
    }
    stage.on('click', onParentClick);
    return () => {
      stage.off('click', onParentClick);
    };
  }, [layerRef, addingPolygon, setSelectedPolygon, setSelectedLight]);

  const toolbar = useMemo(() => {
    return (
      <>
        <ToolbarItem
          label="Add Fog"
          icon={<CloudOutlinedIcon />}
          keyboardShortcuts={['a']}
          onClick={() => {
            const poly = {
              verticies: [],
              type: Types.FogLayer_Polygon_PolygonType.FOG,
              visibleOnTable: true,
            } as Types.FogLayer_Polygon;
            setSelectedPolygon(poly);
            setAddingPolygon(poly);
            setSelectedLight(null);
          }}
        />
        <ToolbarItem
          label="Add Fog Clear"
          icon={<CloudOffOutlinedIcon />}
          keyboardShortcuts={['s']}
          onClick={() => {
            const poly = {
              verticies: [],
              type: Types.FogLayer_Polygon_PolygonType.FOG_CLEAR,
              visibleOnTable: true,
            } as Types.FogLayer_Polygon;
            setSelectedPolygon(poly);
            setAddingPolygon(poly);
            setSelectedLight(null);
          }}
        />
        <ToolbarItem
          label="Add Light"
          icon={<LightbulbOutlinedIcon />}
          onClick={() => {
            const viewportCenter = calculateViewportCenter(layerRef);
            const light = defaultLightSource({
              position: viewportCenter,
            });
            layer.lightSources = [...layer.lightSources, light];
            setSelectedLight(light);
            onUpdate({...layer});
          }}
          keyboardShortcuts={['e']}
        />
        <ToolbarItem
          label="Add Wall"
          icon={<CastleOutlinedIcon />}
          onClick={() => {
            const poly = {
              verticies: [],
              type: Types.FogLayer_Polygon_PolygonType.LIGHT_OBSTRUCTION,
              visibleOnTable: true,
            } as Types.FogLayer_Polygon;
            setSelectedPolygon(poly);
            setAddingPolygon(poly);
            setSelectedLight(null);
          }}
          keyboardShortcuts={['w']}
        />
        <ToolbarSeparator />
        <ToolbarItem
          label={
            selectedPolygon && selectedPolygon.visibleOnTable
              ? 'Hide on Table'
              : 'Show on Table'
          }
          disabled={!selectedPolygon}
          icon={
            selectedPolygon && selectedPolygon.visibleOnTable ? (
              <VisibilityOffOutlinedIcon />
            ) : (
              <VisibilityOutlinedIcon />
            )
          }
          keyboardShortcuts={['d']}
          onClick={() => {
            if (!selectedPolygon) return;
            selectedPolygon.visibleOnTable = !selectedPolygon.visibleOnTable;
            onUpdate({...layer});
          }}
        />
        <EditLightToolbarItem
          light={selectedLight}
          onUpdate={light => {
            const index = layer.lightSources.indexOf(selectedLight!);
            layer.lightSources[index] = light;
            setSelectedLight(light);
            onUpdate({...layer});
          }}
        />
        <ToolbarSeparator />
        <ToolbarItem
          icon={<DeleteOutlinedIcon />}
          label="Delete"
          disabled={selectedPolygon === null && selectedLight === null}
          onClick={() => {
            if (selectedPolygon) {
              const collection = collections[selectedPolygon.type];

              const polygonIndex = collection.indexOf(selectedPolygon);
              if (polygonIndex !== -1) {
                collection.splice(polygonIndex, 1);
              }

              onUpdate({...layer});
              setSelectedPolygon(null);
            } else if (selectedLight) {
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
  }, [selectedPolygon, selectedLight, layer, onUpdate, collections, layerRef]);

  useEffect(() => {
    if (isTable && layerRef.current && tablePPI) {
      layerRef.current.canvas._canvas.style.filter = `blur(${
        tablePPI * BLUR_RADIUS
      }px)`;
    }
  }, [layerRef, isTable, tablePPI]);

  const onPolygonAdded = useCallback(() => {
    if (addingPolygon) {
      const collection = collections[addingPolygon.type];

      if (
        addingPolygon.type !==
          Types.FogLayer_Polygon_PolygonType.LIGHT_OBSTRUCTION &&
        addingPolygon?.verticies &&
        addingPolygon.verticies.length < 3
      ) {
        setAddingPolygon(null);
        setSelectedPolygon(null);
        return;
      }

      setAddingPolygon(null);
      setSelectedPolygon(null);
      collection.push(addingPolygon);

      onUpdate({...layer});
    }
  }, [setAddingPolygon, layer, onUpdate, addingPolygon, collections]);

  const getPolygonStyle = useCallback(
    (poly: Types.FogLayer_Polygon): Partial<Konva.LineConfig> => {
      if (isTable) {
        switch (poly.type) {
          case Types.FogLayer_Polygon_PolygonType.FOG:
            return {
              fill: 'black',
              closed: true,
            };
          case Types.FogLayer_Polygon_PolygonType.FOG_CLEAR:
            return {
              fill: 'black',
              globalCompositeOperation: 'destination-out',
              closed: true,
            };
          case Types.FogLayer_Polygon_PolygonType.LIGHT_OBSTRUCTION:
            return {
              closed: false,
            };
        }
      } else {
        switch (poly.type) {
          case Types.FogLayer_Polygon_PolygonType.FOG:
            return {
              opacity: poly.visibleOnTable ? (active ? 0.7 : 0.4) : 0.3,
              fill: 'black',
              closed: true,
            };
          case Types.FogLayer_Polygon_PolygonType.FOG_CLEAR:
            return {
              opacity: poly.visibleOnTable ? (active ? 0.3 : 1) : 0.6,
              fill: deepPurple[200],
              globalCompositeOperation: active ? undefined : 'destination-out',
              closed: true,
            };
          case Types.FogLayer_Polygon_PolygonType.LIGHT_OBSTRUCTION:
            return {
              stroke: active
                ? poly.visibleOnTable
                  ? deepPurple[700]
                  : deepPurple[400]
                : undefined,
              strokeWidth: active ? 10 : undefined,
              hitStrokeWidth: 20,
              lineCap: 'round',
              strokeScaleEnabled: false,
              closed: false,
            };
        }
      }
      return {};
    },
    [isTable, active]
  );

  const polyToEditablePolygon = (type: Types.FogLayer_Polygon_PolygonType) => {
    return (poly: Types.FogLayer_Polygon, i: number) => {
      poly.type = type;
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
            setSelectedPolygon(poly);
            setSelectedLight(null);
          }}
          adding={false}
          onUpdate={() => {
            onUpdate(layer);
          }}
        />
      );
    };
  };

  layer.lightSources.forEach(defaultLightSource);

  return (
    <Layer ref={layerRef as any} listening={active}>
      {active && <ToolbarPortal>{toolbar}</ToolbarPortal>}

      {layer.fogPolygons.map(
        polyToEditablePolygon(Types.FogLayer_Polygon_PolygonType.FOG)
      )}
      {layer.fogClearPolygons.map(
        polyToEditablePolygon(Types.FogLayer_Polygon_PolygonType.FOG_CLEAR)
      )}

      {layer.lightSources.map((light, i) => (
        <RayCastRevealPolygon
          key={`rcr${i}`}
          light={light}
          displayIcon={!isTable}
          isTable={isTable}
          obstructionPolygons={layer.obstructionPolygons}
          fogPolygons={layer.fogPolygons}
          onUpdate={light => {
            layer.lightSources[i] = light;
            onUpdate(layer);
          }}
          selected={selectedLight === light}
          onSelected={() => {
            setSelectedLight(light);
            setSelectedPolygon(null);
          }}
        />
      ))}

      {layer.obstructionPolygons.map(
        polyToEditablePolygon(
          Types.FogLayer_Polygon_PolygonType.LIGHT_OBSTRUCTION
        )
      )}

      {addingPolygon &&
        (() => {
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
              onUpdate={() => {
                onUpdate(layer);
              }}
            />
          );
        })()}
    </Layer>
  );
};
export default FogLayer;
