import * as Matter from 'matter-js';

export const demo = () => {
  const Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Bodies = Matter.Bodies;

  // create engine
  const engine = Engine.create(),
    world = engine.world;

  // create renderer
  const render = Render.create({
    element: document.getElementById('root') as HTMLElement,
    engine: engine,
    options: {
      width: 800,
      height: 600,
    }
  });

  Render.run(render);

  // create runner
  const runner = Runner.create({});
  Runner.run(runner, engine);

  const block1 = Bodies.rectangle(200, 100, 60, 60, { frictionAir: 0.001 });

  setTimeout(() => {
    Matter.Body.scale(block1, 0.5, 0.5);
  }, 100);

  // add bodies
  World.add(world, [
    // falling blocks
    block1,
    Bodies.rectangle(400, 100, 60, 60, { frictionAir: 0.05 }),
    Bodies.rectangle(600, 100, 60, 60, { frictionAir: 0.1 }),

    // walls
    Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
    Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
    Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
    Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
  ]);
}
