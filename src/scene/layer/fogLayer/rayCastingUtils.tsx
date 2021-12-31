import Konva from 'konva';

import * as Types from '../../../protos/scene';

type Segment = {
  a: Konva.Vector2d,
  b: Konva.Vector2d
};

type Intersection = {
  x: number,
  y: number,
  angle?: number,
  distance: number
};

// Find intersection of RAY & SEGMENT
export function getIntersection(ray: Segment, segment: Segment): Intersection | null {

  // RAY in parametric: Point + Delta*T1
  const r_px = ray.a.x;
  const r_py = ray.a.y;
  const r_dx = ray.b.x - ray.a.x;
  const r_dy = ray.b.y - ray.a.y;

  // SEGMENT in parametric: Point + Delta*T2
  const s_px = segment.a.x;
  const s_py = segment.a.y;
  const s_dx = segment.b.x - segment.a.x;
  const s_dy = segment.b.y - segment.a.y;

  // Are they parallel? If so, no intersect
  const r_mag = Math.sqrt(r_dx * r_dx + r_dy * r_dy);
  const s_mag = Math.sqrt(s_dx * s_dx + s_dy * s_dy);
  if (r_dx / r_mag === s_dx / s_mag && r_dy / r_mag === s_dy / s_mag) {
    // Unit vectors are the same.
    return null;
  }

  // SOLVE FOR T1 & T2
  // r_px+r_dx*T1 = s_px+s_dx*T2 && r_py+r_dy*T1 = s_py+s_dy*T2
  // ==> T1 = (s_px+s_dx*T2-r_px)/r_dx = (s_py+s_dy*T2-r_py)/r_dy
  // ==> s_px*r_dy + s_dx*T2*r_dy - r_px*r_dy = s_py*r_dx + s_dy*T2*r_dx - r_py*r_dx
  // ==> T2 = (r_dx*(s_py-r_py) + r_dy*(r_px-s_px))/(s_dx*r_dy - s_dy*r_dx)
  const T2 = (r_dx * (s_py - r_py) + r_dy * (r_px - s_px)) / (s_dx * r_dy - s_dy * r_dx);
  const T1 = (s_px + s_dx * T2 - r_px) / r_dx;

  // Must be within parametic whatevers for RAY/SEGMENT
  if (T1 < 0) return null;
  if (T2 < 0 || T2 > 1) return null;

  // Return the POINT OF INTERSECTION
  return {
    x: r_px + r_dx * T1,
    y: r_py + r_dy * T1,
    distance: T1
  };
}

export function getVisibilityPolygon(position: Konva.Vector2d, polygons: Array<Types.FogLayer_Polygon>): Types.FogLayer_Polygon {
  // Get all unique points
  const points = new Array<Konva.Vector2d & { angle?: number }>();
  const segments = new Array<Segment>();

  for (const polygon of polygons) {
    if (polygon.verticies.length === 0) continue;

    let previousVertex: Konva.Vector2d | null = null;
    for (const vertex of polygon.verticies) {
      points.push(vertex);
      if (previousVertex) {
        segments.push({
          a: previousVertex,
          b: vertex
        });
      }
      previousVertex = vertex;
    }
  }

  // Get all angles
  const uniqueAngles = new Array<number>();
  for (let j = 0; j < points.length; j++) {
    let point = points[j];
    let angle = Math.atan2(point.y - position.y, point.x - position.x);
    point.angle = angle;
    uniqueAngles.push(angle - 0.00001, angle, angle + 0.00001);
  }

  // RAYS IN ALL DIRECTIONS
  const intersects = new Array<Intersection>();
  for (let j = 0; j < uniqueAngles.length; j++) {
    const angle = uniqueAngles[j];

    // Calculate dx & dy from angle
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);

    const ray = {
      a: { x: position.x, y: position.y },
      b: { x: position.x + dx, y: position.y + dy }
    } as Segment;

    // Find CLOSEST intersection
    let closestIntersect: Intersection | null = null;
    for (let i = 0; i < segments.length; i++) {
      const intersect = getIntersection(ray, segments[i]);
      if (!intersect) continue;

      if (!closestIntersect || intersect.distance < closestIntersect.distance) {
        closestIntersect = intersect;
      }
    }

    // Intersect angle
    if (!closestIntersect) continue;
    closestIntersect.angle = angle;

    // Add to list of intersects
    intersects.push(closestIntersect);
  }

  // Sort intersects by angle
  return {
    type: Types.FogLayer_Polygon_PolygonType.FOG_CLEAR, // TODO: change
    visibleOnTable: true,
    verticies: intersects.sort(function (a, b) {
      return a.angle! - b.angle!;
    })
  }
}