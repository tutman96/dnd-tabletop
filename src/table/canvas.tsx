import {Stage} from 'react-konva';
import {Helmet} from 'react-helmet';

import * as Types from '../protos/scene';
import * as ExternalTypes from '../protos/external';

import {flattenLayer, LayerTypeToComponent} from '../scene/layer';
import TableViewOverlay from '../scene/layer/tableView';

const TableCanvas: React.FunctionComponent<{
  tableScene: Types.Scene | null;
  tableConfiguration: ExternalTypes.GetTableConfigurationResponse;
}> = ({tableScene, tableConfiguration}) => {
  const theta = Math.atan(
    tableConfiguration.resolution!.height / tableConfiguration.resolution!.width
  );
  const widthInch = tableConfiguration.size * Math.cos(theta);

  const ppi = tableConfiguration.resolution!.width / widthInch;

  return (
    <>
      <Helmet title="D&amp;D Table View" />
      {tableScene && (
        <Stage
          width={tableConfiguration.resolution!.width}
          height={tableConfiguration.resolution!.height}
          offsetX={tableScene.table!.offset!.x}
          offsetY={tableScene.table!.offset!.y}
          scaleX={tableScene.table!.scale * ppi}
          scaleY={tableScene.table!.scale * ppi}
        >
          {tableScene.layers.map(flattenLayer).map(layer => {
            const Component = LayerTypeToComponent[layer.type];
            if (!Component || layer.visible === false) return null;
            return (
              <Component
                key={layer.id}
                isTable={true}
                layer={layer}
                onUpdate={() => {}}
                active={false}
              />
            );
          })}
          <TableViewOverlay
            options={tableScene.table!}
            active={false}
            onUpdate={() => {}}
            showBorder={false}
            showGrid={tableScene.table!.displayGrid}
          />
        </Stage>
      )}
    </>
  );
};

export default TableCanvas;
