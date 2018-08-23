import { Body, Manifold } from "./body";
export class World {
  public bodys: Body[] = [];
  public is_pause = false;
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
    for (const manifold of manifolds) {
      const {pair, overlap} = manifold;
      const body1 = pair[0];
      const body2 = pair[1];

      // resolve velocity
      const restitution = Math.min(body1.restitution, body2.restitution);
      const velocity_relative = body1.velocity.minus(body2.velocity);
      const normal = overlap.normalize();
      position_correction(manifold);
      const vel_along_normal = velocity_relative.dot_product(normal);
      if (vel_along_normal > 0) {
        return;
      }
      let j = -(1 + restitution) * vel_along_normal;
      j /= body1.inv_mass() + body2.inv_mass();
      const impulse = normal.product(j);
      body1.velocity = body1.velocity.add(impulse.product(body1.inv_mass()));
      body2.velocity = body2.velocity.minus(impulse.product( body2.inv_mass()));

      // resolve angular velocity

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
      const pairs = this.get_collision_pairs();
      // if (pairs.find((manifold) => manifold.pair[0].name === 'body1' || manifold.pair[0].name === 'body2' || manifold.pair[1].name === 'body1' || manifold.pair[1].name === 'body2')) {
      //   console.log(pairs);
      //   if (pairs.length >= 2) {
      //     console.log(pairs);
      //     this.puase();
      //   } 
      // }
      const bodys = this.bodys;
      bodys.forEach(this.update_body.bind(this, tick));
      this.resolve_collision(pairs);
    }
  }
  puase = () => this.is_pause = true;
  resume = () => this.is_pause = false;
}
