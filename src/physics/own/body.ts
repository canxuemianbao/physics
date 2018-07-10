import { Vector, Point, origin_point, Projection} from './utils';
import { Vertices } from './vertices';

export interface Config {
  acceleration?:Vector;
  velocity?:Vector;
  mass?:number;
  density?:number;
  angle?:number;
  restitution?:number;
  pos?:Point;
}

export class Manifold {
  // body[0] respresents the main Body
  constructor(
    public pair:[Body, Body],
    public overlap:Vector,
  ) {}

  is_separated() {
    return this.overlap.magnitude() === 0;
  }
}

export class Body {
  public acceleration = new Vector(0, 0);
  public velocity = new Vector(0, 0);
  public mass = 0;
  public density = 1;
  public angle = 0;
  public restitution = 0;
  public pos = new Point(0, 0);
  public vertices = new Vertices([]);
  constructor(dots:Point[], options:Config) {
    this.vertices = new Vertices(dots);
    this.acceleration = options.acceleration || this.acceleration;
    this.velocity = options.velocity || this.velocity;
    this.density = options.density || this.density;
    this.restitution = options.restitution || this.restitution;
    this.mass = options.mass || this.density * this.vertices.area;
    this.pos = options.pos || this.pos;
    this.angle = options.angle || 0;
    this.change_pos(this.pos);    
  }
  momentum() {
    return this.velocity.product(this.mass);
  }
  inv_mass() {
    if (this.mass === 0) {
      return 0;
    }
    return 1 / this.mass;
  }
  change_pos(new_pos:Point) {
    const distance_x = new_pos.x - this.pos.x;
    const distance_y = new_pos.y - this.pos.y;
    this.pos = new_pos;
    this.vertices.move(distance_x, distance_y);
  }
  update(tick:number) {
    const pos_x = this.velocity.x * tick + this.pos.x;
    const pos_y = this.velocity.y * tick + this.pos.y;
    this.change_pos(new Point(pos_x, pos_y));
    this.velocity.x = this.acceleration.x * tick + this.velocity.x;
    this.velocity.y = this.acceleration.y * tick + this.velocity.y;
  }

  // TODO: reture manifold
  collide_with(body:Body) {
    const axes1 = this.get_axes();
    const axes2 = body.get_axes();

    const result1 = this.collide_with_axes(body, axes1);
    const result2 = this.collide_with_axes(body, axes2);
    return result1.magnitude() > result2.magnitude() ? new Manifold([body, this], result2) : new Manifold([this, body], result1);
  }

  collide_with_axes(body:Body, axes:Vector[]) {
    let result = new Vector(0, 0);
    if (axes.length === 0) {
      return result;
    }
    let depth = Infinity;
    for (const axis of axes) {
      const projection1 = body.project(axis);
      const projection2 = this.project(axis);
      const current_depth = projection1.overlap_length(projection2);
      if (current_depth === 0) {
        return result;
      }
      depth = Math.min(depth, current_depth);
      result = depth === current_depth ? axis.product(current_depth) : result;
    }
    return result;
  }

  project(axis:Vector) {
    let min = Infinity;
    let max = -Infinity;
    for(const dot of this.vertices.dots) {
      const project_value = dot.minus(origin_point).dot_product(axis);
      if (project_value > max) {
        max = project_value;
      }
      if (project_value < min) {
        min = project_value;
      }
    }
    return new Projection(min, max, axis);
  }

  get_axes() {
    const dots = this.vertices.dots;
    const normals = [];
    for (let i = 1; i< dots.length; i++) {
      normals.push(dots[i].minus(dots[i - 1]).normal());
    }
    normals.push(dots[0].minus(dots[dots.length - 1]).normal());
    return normals;
  }
}