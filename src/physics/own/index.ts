import { 
  create,
} from './render';
import { Body } from './body';
import {
  World,
} from './physics';
import { Point, Vector } from './utils';

const world = new World();

export const demo = () => {
  const body1 = new Body([
    new Point(0, 0),
    new Point(100, 0),
    new Point(100, 100),
    new Point(0, 100),
  ], {
    // angle: 25 / 180 * Math.PI,
    // acceleration: {y:50, x:0},
    velocity: new Vector(0, 50),
    restitution: 1,
  });
  const body2 = new Body([
    new Point(50, 150),
    // new Point(70, 170),
    // new Point(100, 240),
    // new Point(90, 150),
    // new Point(100, 150),
    new Point(150, 250),
    new Point(50, 250),
  ], {
    density: 2,
    restitution: 1,
  });
  world.add_body(body1);
  world.add_body(body2);
  create(world, {});
};

export const cancel = () => world.is_pause ? world.resume() : world.puase();

export const resume = cancel;