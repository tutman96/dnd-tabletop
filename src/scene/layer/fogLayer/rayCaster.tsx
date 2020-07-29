import React from 'react';
import { Vector2d } from "konva/types/types";
import { Line } from 'react-konva';


export interface IPolygon {
  verticies: Array<Vector2d>
  visibleOnTable: boolean;
}

function calculateIlluminatedPolygon(obstructionPolygons: Array<IPolygon>, position: Vector2d) {
  return {
    verticies: new Array<Vector2d>()
  }
}

type Props = {
  obstructionPolygons: Array<IPolygon>;
  lightSourcePosition: Vector2d;
}
const IlluminationPolygon: React.SFC<Props> = ({ lightSourcePosition, obstructionPolygons }) => {

  return (
    <Line
      points={[lightSourcePosition.x, lightSourcePosition.y, lightSourcePosition.x + 10, lightSourcePosition.y + 10]}
      fill="red"
      stroke="black"
      strokeWidth={5}
      closed={true}
    />
  );
}
export default IlluminationPolygon;