import { 
  create,
} from './render';
import { Body } from './body';
import {
  World,
} from './physics';
import { Point, Vector } from './utils';

const world = new World();

const points = [new Point(0, -100), new Point(1000, -100), new Point(1000, 10), new Point(0, 10)].reverse();


export const demo = () => {
  const wall1 = new Body(points, {density:Infinity, restitution:1});
  const wall2 = new Body(points, {density:Infinity, restitution:1});
  const wall3 = new Body(points, {density:Infinity, restitution:1});
  const wall4 = new Body(points, {density:Infinity, restitution:1});

  wall2.rotate(90 / 180 * Math.PI);
  wall2.change_pos(new Point(600, 400));
  wall4.change_pos(new Point(500, 400));
  (wall4 as any).name = 'wall4';

  const body1 = new Body([
    new Point(0, 0),
    new Point(100, 0),
    new Point(100, 100),
    new Point(0, 100),
  ].reverse(), {
    angle: 25 / 180 * Math.PI,
    // acceleration: {y:50, x:0},
    velocity: new Vector(0, 100),
    density: 2,
    restitution: 1,
  });
  body1.change_pos(new Point(150, 50));
  const body2 = new Body([
    // new Point(50, 150),
    // new Point(70, 170),
    new Point(100, 240),
    new Point(90, 150),
    // new Point(100, 150),
    new Point(150, 250),
    // new Point(50, 250),
  ].reverse(), {
    // velocity: new Vector(0, -20),
    density: Infinity,
    restitution: 0,
  });
  world.add_body(wall1);
  // world.add_body(wall2);
  // world.add_body(wall3);
  world.add_body(wall4);

  world.add_body(body1);
  // world.add_body(body2);
  create(world, {
    width: 1080,
    height: 1080,
  });
  // console.log('wall4 axe', wall4.get_axes());
  // console.log('wall1 axe', wall1.get_axes());
  // console.log('body axe', body1.get_axes());
};

export const cancel = () => world.is_pause ? world.resume() : world.puase();

export const resume = cancel;