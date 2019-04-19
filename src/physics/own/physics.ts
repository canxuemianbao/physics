import { Body, Manifold } from "./body";
import * as _ from 'lodash';
import { Vector, Point, radian_to_angle, angle_to_radian } from "./utils";
import { swept } from './ccd';
import { cancel } from './index';

interface WorldConfig {
  friction_air?:number;
  gravity?:Vector;
}
export class World {
  public bodys: Body[] = [];
  public is_pause = false;
  public friction_air = 0;
  public gravity = new Vector(0, 0);
  constructor(options:WorldConfig) {
    this.friction_air = options.friction_air || this.friction_air;
    this.gravity = options.gravity || this.gravity;
  }
  add_body(body: Body) {
    this.bodys.push(body);
  }
  get_collision_pairs() {
    const collisions_info = [];
    for (let i = 0; i < this.bodys.length; i++) {
      const body1 = this.bodys[i];
      for (let j = i + 1; j < this.bodys.length; j++) {
        const body2 = this.bodys[j];
        const manifold = body1.collide_with(body2);
        if (!manifold.is_separated()) {
          collisions_info.push(manifold);
        } else {
          // for test
          {
            delete body1.vertices.contacts;
            delete body2.vertices.contacts;
          }
        }
      }
    }
    return collisions_info;
  }
  resolve_collision = (manifolds: Manifold[]) => {
    const position_correction = (manifold:Manifold) => {
      const {pair, overlap} = manifold;
      const body1 = pair[0];
      const body2 = pair[1];
      const slop = 0.01;
      const percent = 0.2;
      const correction_length = (overlap.magnitude() - slop) / (body1.inv_mass() + body2.inv_mass()) * percent;
      const correction = overlap.normalize().product(correction_length);
      
      const new_pos1 = body1.pos.add(correction.product(body1.inv_mass()));
      const new_pos2 = body2.pos.minus(correction.product(body2.inv_mass()));
      body1.change_pos(new_pos1);
      body2.change_pos(new_pos2);
    }

    const get_impuse_weight = (
      body1:Body,
      body2:Body,
      contact:Point,
    ) => (direction:Vector) => {
      const restitution = Math.min(body1.restitution, body2.restitution);
      const body1_rotation_vector = contact.minus(body1.pos);
      const body2_rotation_vector = contact.minus(body2.pos); 
      const relative_velocity = body1.velocity.minus(body2.velocity);
      
      const numerator = -(1 + restitution) * (relative_velocity.dot_product(direction));
      const denominator = 
        body1.inv_mass() +
        body2.inv_mass() +
        Math.pow(body1_rotation_vector.dot_product(direction), 2) / body1.vertices.inertia +
        Math.pow(body2_rotation_vector.dot_product(direction), 2) / body2.vertices.inertia;
      return numerator / denominator;
    };
    for (const manifold of manifolds) {
      const {pair, overlap, contacts} = manifold;
      position_correction(manifold);
      const body1 = pair[0];
      const body2 = pair[1];
      const normal = overlap.normalize();
      const tangent = overlap.normal();
      let normal_impulse = new Vector(0, 0);
      let tangent_impulse = new Vector(0, 0);
      let body1_angle_speed = body1.angular_speed;
      let body2_angle_speed = body2.angular_speed;
      const friction = Math.min(body1.friction, body2.friction);
      for (const contact of contacts) {
        // for test 
        {
          body1.vertices.contacts = _.assign([], contacts);
          body2.vertices.contacts = _.assign([], contacts);
          body1.vertices.normal = overlap;
        }
        const body1_rotation_vector = contact.minus(body1.pos);
        const body2_rotation_vector = contact.minus(body2.pos);
        const normal_impulse_weigth = get_impuse_weight(body1, body2, contact)(normal);
        normal_impulse = normal.product(normal_impulse_weigth);
        const tangent_impulse_weigth = get_impuse_weight(body1, body2, contact)(tangent) * friction;
        tangent_impulse = tangent_impulse.add(tangent.product(tangent_impulse_weigth));
        body1_angle_speed = body1_angle_speed + (body1_rotation_vector.cross(normal_impulse)) / body1.vertices.inertia;
        body1.angular_speed = body1_angle_speed + (body1_rotation_vector.cross(tangent_impulse)) / body1.vertices.inertia;
        body2_angle_speed = body2_angle_speed - (body2_rotation_vector.cross(normal_impulse)) / body2.vertices.inertia;
        body2.angular_speed = body2_angle_speed - (body2_rotation_vector.cross(tangent_impulse)) / body2.vertices.inertia;
      }
      const velocity_relative = body1.velocity.minus(body2.velocity);
      position_correction(manifold);
      if (velocity_relative.dot_product(normal) > 0) {
        break;
      }
      tangent_impulse = tangent_impulse.product(0.05);
      // console.log('======tangent======');
      // console.log('tangent_impulse', tangent_impulse);
      // console.log('tangent velocity', tangent_impulse.product(body2.inv_mass()));
      body1.velocity = body1.velocity.add(normal_impulse.product(body1.inv_mass()));
      body2.velocity = body2.velocity.minus(normal_impulse.product(body2.inv_mass()));  
      // body1.velocity = body1.velocity.add(tangent_impulse.product(body1.inv_mass()));
      // const tangent_speed = tangent_impulse.product(body2.inv_mass());
      body2.velocity = body2.velocity.minus(tangent_impulse.product(body2.inv_mass())); 
    }
  };
  get_bodys() {
    return this.bodys;
  }
  update_body = (tick: number, body: Body) => {
    body.update(tick);
  };
  update(tick: number) {
    if (!this.is_pause) {
      const bodys = this.bodys;
      // console.log('tick', tick);
      swept(bodys[0], bodys[1]);
      // this.puase();
      bodys.forEach(this.update_body.bind(this, tick));
      let pairs = this.get_collision_pairs();
      this.resolve_collision(pairs);
    }
  }
  puase = () => this.is_pause = true;
  resume = () => this.is_pause = false;
}
