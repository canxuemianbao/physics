import { Point, Vector } from './utils';

const empty = [new Point(0, 0), new Point(0, 0)];
export class Vertices {
  public area:number;
  public centroid:Point;

  constructor(
    public dots:Point[] = empty,
  ) {
    this.dots = this.dots.length <=2 ? empty : this.dots;
    this.init();
  }

  is_empty() {
    return this.dots === empty;
  }

  move(distance_x:number, distance_y:number) {
    const new_dots = [];
    for (const dot of this.dots) {
      dot.x += distance_x;
      dot.y += distance_y;
      new_dots.push(dot);
    }
    this.dots = new_dots;
    this.centroid.x += distance_x;
    this.centroid.y += distance_y;
  }

  rotate(angle:number, center:Point) {
    if (this.is_empty()) {
      return;
    }
    if (angle === 0) {
      return;
    }
    const new_dots = [];
    for (const dot of this.dots) {
      const old_vector = dot.minus(center);
      const new_vector = old_vector.rotate(angle);
      new_dots.push(new Point(new_vector.x + center.x, new_vector.y + center.y));
    }
    this.dots = new_dots;
  }

  // TODO: maybe direction is contrast
  triangle_area(a:Point, b:Point, c:Point) {
    return (a.y * (b.x - c.x) + b.y * (c.x - a.x) + c.y * (a.x - b.x)) / 2;
  }

  triangle_centroid(a:Point, b:Point, c:Point) {
    return new Point((a.x + b.x + c.x) / 3, (a.y + b.y + c.y) / 3);
  }

  init() {
    let area = 0;
    let centroid = new Point(0, 0);
    const point_a = this.dots[0];
    for (let i = 1; i < this.dots.length - 1; i++) {
      const point_b = this.dots[i];
      const point_c = this.dots[i + 1];
      const triangle_area = this.triangle_area(point_a, point_b, point_c);
      const triangle_centroid = this.triangle_centroid(point_a, point_b, point_c);
      const centroid_x = (triangle_area * triangle_centroid.x + centroid.x * area) / (area + triangle_area);
      const centroid_y = (triangle_area * triangle_centroid.y + centroid.y * area) / (area + triangle_area);
      centroid = new Point(centroid_x, centroid_y);
      area += triangle_area;
    }
    this.area = Math.abs(area);
    this.centroid = centroid;
  }
}