import { Vector, Point, origin_point, Projection} from './utils';
import { Vertices, empty } from './vertices';

export interface Config {
  acceleration?:Vector;
  velocity?:Vector;
  mass?:number;
  density?:number;
  angle?:number;
  angular_speed?:number;
  restitution?:number;
  pos?:Point;
  name?:string;
}

export class Manifold {
  // pair[0] respresents the main Body
  constructor(
    public pair:[Body, Body],
    public overlap:Vector,
    public contact_point:Point,
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
  public angular_speed = 0;
  public restitution = 0;
  public vertices = new Vertices([]);
  public name = '';
  constructor(dots:Point[], options:Config) {
    this.density = options.density || this.density;
    this.vertices = new Vertices(dots, this.density);
    this.acceleration = options.acceleration || this.acceleration;
    this.angular_speed = options.angular_speed || this.angular_speed;
    this.velocity = options.velocity || this.velocity;
    this.restitution = options.restitution || this.restitution;
    this.mass = options.mass || this.density * this.vertices.area;
    this.angle = options.angle || 0;
    this.name = options.name || this.name;
    this.change_pos(options.pos || this.pos);    
    this.rotate(this.angle);
  }
  public get pos() {
    return this.vertices.centroid || new Point(0, 0);
  }
  public get speed() {
    return this.velocity.magnitude();
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
    this.vertices.move(distance_x, distance_y);
  }
  rotate(angle:number) {
    this.vertices.rotate(angle, this.vertices.centroid);
    this.angle = angle; 
  }
  update(tick:number) {
    const pos_x = this.velocity.x * tick + this.pos.x;
    const pos_y = this.velocity.y * tick + this.pos.y;
    this.velocity.x = this.acceleration.x * tick + this.velocity.x;
    this.velocity.y = this.acceleration.y * tick + this.velocity.y;
    this.change_pos(new Point(pos_x, pos_y));
    this.rotate(this.angular_speed + this.angle);
  }

  collide_with(body:Body) {
    const axes1 = this.get_axes();
    const axes2 = body.get_axes();

    const result1 = this.collide_with_axes(body, axes1);
    const result2 = this.collide_with_axes(body, axes2);
    // TODO: use new contact method
    let contact; 
    if (result1.magnitude() < result2.magnitude()) {
      contact = this.get_nearest_vertex(body).nearest_vertex;
    } else {
      contact = body.get_nearest_vertex(this).nearest_vertex;
    }
    const result = 
      result1.magnitude() > result2.magnitude() ?
      new Manifold([body, this], result2, contact as Point) :
      new Manifold([this, body], result1, contact as Point);
    // if direction is contrast
    if (result.overlap.dot_product(result.pair[0].pos.minus(result.pair[1].pos)) < 0) {
      result.overlap.x = -result.overlap.x;
      result.overlap.y = -result.overlap.y;
    }
    return result;
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
        return new Vector(0, 0);
      }
      depth = Math.min(depth, current_depth);
      result = depth === current_depth ? axis.product(current_depth) : result;
    }
    return result;
  }

  get_nearest_vertex(body:Body) {
    let distance = Infinity;
    let nearest_vertex;
    for(const dot of body.vertices.dots) {
      const current_distance = new Vector(this.pos.x - dot.x, this.pos.y - dot.y).magnitude();
      distance = Math.min(distance, current_distance);
      nearest_vertex = distance === current_distance ? dot : nearest_vertex;
    }
    return {
      distance,
      nearest_vertex,
    }
  }

  project(axis:Vector) {
    let min = Infinity;
    let max = -Infinity;
    let min_dot = empty[0];
    let max_dot = empty[1];
    for(const dot of this.vertices.dots) {
      const project_value = dot.minus(origin_point).dot_product(axis);
      if (project_value > max) {
        max = project_value;
        max_dot = dot;
      }
      if (project_value < min) {
        min = project_value;
        min_dot = dot;
      }
    }
    return new Projection(min, max, axis, min_dot, max_dot);
  }

  get_axes() {
    const dots = this.vertices.dots;
    const normals = [];
    for (let i = 1; i< dots.length; i++) {
      normals.push(dots[i - 1].minus(dots[i]).normal());
    }
    normals.push(dots[dots.length - 1].minus(dots[0]).normal());
    return normals;
  }
}