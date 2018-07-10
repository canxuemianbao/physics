import { World } from './physics';
import { Body } from './body';

const canvas = document.createElement('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

export function create(world:World, options:any) {
  canvas.width = options.width || 640;
  canvas.height = options.height || 360;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const render = new Render(world);
  requestAnimationFrame(render.update);
  if (options.id) {
    const container = document.getElementById(options.id) as HTMLElement;
    container.appendChild(canvas);
  } else {
    document.body.appendChild(canvas);
  }
}

function draw_body(body:Body) {
  ctx.save();
  // prepare
  // ctx.translate(body.pos.x, body.pos.y);
  // ctx.rotate(body.angle);
  // ctx.translate(-body.pos.x, -body.pos.y);
  ctx.strokeStyle = '#FFFFFF';  
  // draw
  const dots = body.vertices.dots;
  ctx.beginPath();
  ctx.moveTo(dots[0].x, dots[0].y);
  dots.forEach((dot) => ctx.lineTo(dot.x, dot.y));
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.strokeStyle = 'rgb(243, 139, 19)';  
  ctx.fillStyle = 'rgb(243, 139, 19)';  
  ctx.arc(body.vertices.centroid.x, body.vertices.centroid.y, 1.5, 0, 2 * Math.PI, false);
  ctx.stroke();
  ctx.fill();
  ctx.restore();
}

export function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillRect(0, 0, canvas.width, canvas.height);  
}

class Render {
  world:World;
  last_render_time:number;
  constructor(world:World) {
    this.world = world;
    this.tick();
  }

  tick() {
    clear();
    this.world.get_bodys().forEach(draw_body);  
  }

  update = (now:number) =>{
    const tick = (now - this.last_render_time || 0) / 1000;
    this.world.update(tick);
    this.tick();
    this.last_render_time = now;
    const raf = requestAnimationFrame(this.update);
    this.clear = () => cancelAnimationFrame(raf);
  }

  clear() {}
}