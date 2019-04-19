import { Vector, Point, origin_point, Projection} from './utils';
import { swept } from './ccd';
import { Vertices, empty } from './vertices';

export interface Config {
  friction?:number;
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
    public contacts:Point[],
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
  public friction = 0;
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
    this.friction = options.friction || this.friction;
    this.change_pos(options.pos || this.pos);    
    this.rotate(this.angle);
  }
  public get pos() {
    return this.vertices.centroid || new Point(0, 0);
  }
  public get speed() {
    return this.velocity.magnitude();
  }
  public get momentum() {
    return this.velocity.product(this.mass);
  }
  public get energy() {
    return this.velocity.dot_product(this.velocity) * this.mass;
  }
  public get angularMomentum() {
    return this.vertices.inertia * this.angular_speed;
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
    this.angle = this.angle + angle; 
  }
  update(tick:number) {
    const pos_x = this.velocity.x * tick + this.pos.x;
    const pos_y = this.velocity.y * tick + this.pos.y;
    this.velocity.x = this.acceleration.x * tick + this.velocity.x;
    this.velocity.y = this.acceleration.y * tick + this.velocity.y;
    this.change_pos(new Point(pos_x, pos_y));
    if (this.angular_speed) {
      this.rotate(this.angular_speed);
    }
  }

  collide_with(body:Body) {
    let axes1 = this.get_axes();
    let axes2 = body.get_axes();

    const relative_direction1 = body.pos.minus(this.pos);
    const relative_direction2 = this.pos.minus(body.pos);

    // remove confuse axis
    axes1 = axes1.filter((axis) => axis.dot_product(relative_direction1) >= 0);
    axes2 = axes2.filter((axis) => axis.dot_product(relative_direction2) >= 0);

    const result1 = this.collide_with_axes(body, axes1);
    const result2 = this.collide_with_axes(body, axes2);

    // return because doesn't trigger collision
    if (result1.magnitude() === 0 || result2.magnitude() === 0) {
      return new Manifold([body, this], new Vector(0, 0), []); 
    }

    let contacts = []; 
    if (result1.magnitude() > result2.magnitude()) {
      // this collide body
      contacts = this.get_nearest_vertexes(result2.normalize());
    } else {
      // body collide this
      contacts = body.get_nearest_vertexes(result1.normalize());
    }
    const result = 
      result1.magnitude() > result2.magnitude() ?
      new Manifold([body, this], result2, contacts) :
      new Manifold([this, body], result1, contacts);
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

  swept(body:Body) {
    const distance_bewteen = this.pos.minus(body.pos);
    const distance_scalar = distance_bewteen.magnitude();
    const speed_bewteen = body.velocity.minus(this.velocity);
    const speed_scalar = speed_bewteen.dot_product(distance_bewteen.normalize());
    if (speed_scalar * distance_scalar < 0) {
      return;
    }
    const time = distance_scalar / speed_scalar;
    console.log('distance_scalar', distance_scalar);
    console.log('speed_bewteen', distance_bewteen.normalize());
    console.log('time', time);
  }

  get_nearest_vertexes(normal:Vector) {
    let distance = -Infinity;
    let nearest_vertexes:Point[] = [];
    let nearest_vertexes_index = -1;
    for (let i = 0; i < this.vertices.dots.length; i++) {
      const dot = this.vertices.dots[i];
      const vector = new Vector(dot.x - this.pos.x, dot.y - this.pos.y);
      const temp_distance = -vector.dot_product(normal);
      if (temp_distance > distance) {
        distance = temp_distance;
        nearest_vertexes = [dot];
        nearest_vertexes_index = i;
      }
    }
    if (distance !== -Infinity) {
      const possible_nearest_vertexes1 = this.vertices.dots[(nearest_vertexes_index + 1) % (this.vertices.dots.length)];
      let vector = new Vector(possible_nearest_vertexes1.x - this.pos.x, possible_nearest_vertexes1.y - this.pos.y);
      let temp_distance = -vector.dot_product(normal);
      if (Math.abs(temp_distance - distance) < 0.001) {
        nearest_vertexes.push(possible_nearest_vertexes1);
        return nearest_vertexes;
      }

      const possible_nearest_vertexes2 = this.vertices.dots[(nearest_vertexes_index - 1 + this.vertices.dots.length) % (this.vertices.dots.length)];
      vector = new Vector(possible_nearest_vertexes2.x - this.pos.x, possible_nearest_vertexes2.y - this.pos.y);
      temp_distance = -vector.dot_product(normal);
      if (Math.abs(temp_distance - distance) < 0.001) {
        nearest_vertexes.push(possible_nearest_vertexes2);
        return nearest_vertexes;
      }      
    }
    return nearest_vertexes;
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

  // direction must be outside the edge
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