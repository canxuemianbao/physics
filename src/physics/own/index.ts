import { create } from "./render";
import { Body } from "./body";
import { World } from "./physics";
import { Point, Vector } from "./utils";

const world = new World({ gravity: new Vector(0, 100) });

const points = [new Point(0, -100), new Point(1000, -100), new Point(1000, 10), new Point(0, 10)].reverse();

export const demo = () => {
  const wall1 = new Body(points, { density: Infinity, restitution: 1, name: "wall1" });
  const wall2 = new Body(points, { density: Infinity, restitution: 1, name: "wall2" });
  const wall3 = new Body(points, { density: Infinity, restitution: 1, name: "wall3" });
  const wall4 = new Body(points, { density: Infinity, restitution: 1, name: "wall4", friction: 1 });

  wall2.rotate((90 / 180) * Math.PI);
  wall3.rotate((90 / 180) * Math.PI);
  wall2.change_pos(new Point(1125, 400));
  wall3.change_pos(new Point(-25, 400));
  wall1.change_pos(new Point(550, -50));
  wall4.change_pos(new Point(550, 700));

  const body1 = new Body([new Point(0, 0), new Point(100, 0), new Point(100, 100), new Point(0, 100)].reverse(), {
    angle: (0 / 180) * Math.PI,
    // angular_speed: 1 / 180 * Math.PI,
    // acceleration: {y:50, x:0},
    // acceleration: new Vector(0, 0),
    velocity: new Vector(0, 150),
    // friction: 0.01,
    // density: 2,
    restitution: 1,
    name: "body1",
  });
  body1.change_pos(new Point(500, 550));
  const body2 = new Body(
    [
      new Point(0, 0),
      // new Point(100, 0),
      new Point(100, 100),
      new Point(0, 100),
      // new Point(100, 150),
      // new Point(150, 250),
      // new Point(50, 250),
    ].reverse(),
    {
      velocity: new Vector(100, 300),
      angle: (30 * Math.PI) / 180,
      density: 1,
      restitution: 1,
      friction: 1,
      pos: new Point(500, 400),
      name: "body2",
    }
  );
  const body3 = new Body(
    [
      // new Point(50, 150),
      // new Point(70, 170),
      // new Point(100, 240),
      // new Point(90, 150),
      new Point(500, 550),
      new Point(450, 450),
      new Point(550, 550),
    ].reverse(),
    {
      velocity: new Vector(100, -100),
      density: 1,
      restitution: 1,
      friction: 1,
      name: "body3",
      pos: new Point(200, 300),
    }
  );
  world.add_body(wall1);
  world.add_body(wall2);
  world.add_body(wall3);
  world.add_body(wall4);

  world.add_body(body1);
  world.add_body(body2);
  world.add_body(body3);
  create(world, {
    width: 1080,
    height: 1080,
  });
};

export const cancel = () => (world.is_pause ? world.resume() : world.puase());

export const resume = cancel;
