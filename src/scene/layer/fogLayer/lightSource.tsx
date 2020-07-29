import React from 'react';
import IlluminationPolygon, { IPolygon } from './rayCaster';
import { ILightSource } from './index';
import { Circle } from 'react-konva';
import { useTheme } from 'sancho';

type Props = {
  lightSource: ILightSource;
  obstructionPolygons: Array<IPolygon>;
  editable: boolean;
};
const LightSource: React.SFC<Props> = ({ lightSource, obstructionPolygons, editable }) => {
  const theme = useTheme();

  return (
    <>
      <IlluminationPolygon lightSourcePosition={lightSource.position} obstructionPolygons={obstructionPolygons} />
      <Circle
        fill={theme.colors.palette.yellow.light}
        stroke={theme.colors.palette.yellow.base}
        strokeWidth={2}
        draggable={true}
        radius={1}
      />
    </>
  );
};
export default LightSource;