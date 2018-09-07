import { World } from './physics';
import { Body } from './body';
import * as _ from 'lodash';

const canvas = document.createElement('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

const colors_array = [
  [
    '#FFFFFF',
    '#CCCCCC',
    '#C0C0C0',
    '#999999',
    '#666666',
    '#333333',
    '#000000',
  ], [
    '#FBCCCC',
    '#F66666',
    '#F50605',
    '#CD0400',
    '#990200',
    '#660100',
    '#330000',
  ], [
    '#FBCC99',
    '#F89966',
    '#F89902',
    '#F66605',
    '#CC6502',
    '#993300',
    '#663300',
  ], [
    '#FEFF99',
    '#FEFF66',
    '#FACC65',
    '#FACC34',
    '#CC9933',
    '#996633',
    '#663333',
  ], [
    '#FEFFCD',
    '#FDFF33',
    '#FDFF03',
    '#FACC01',
    '#999900',
    '#656601',
    '#343300',
  ], [
    '#98FF99',
    '#66FF99',
    '#4CFF32',
    '#3BCD00',
    '#2A9900',
    '#196600',
    '#083300',
  ], [
    '#99FFFF',
    '#53FFFF',
    '#65CCCC',
    '#41CCCC',
    '#339999',
    '#336665',
    '#0A3333',
  ], [
    '#CCFFFF',
    '#66FFFF',
    '#44CCFF',
    '#3366FF',
    '#3333FF',
    '#0F0299',
    '#060166',
  ], [
    '#CCCCFF',
    '#9898FF',
    '#6665CC',
    '#6533FF',
    '#6606CC',
    '#333498',
    '#340299',
  ], [
    '#FCCCFF',
    '#F999FF',
    '#CC66CC',
    '#CC33CC',
    '#993399',
    '#653366',
    '#330133',
  ],
];

function get_random_color () {
  const max = colors_array.length - 1;
  return colors_array[_.random(0, max)][6];
}

const contact_point_color = 'rgb(107, 238, 144)';    
const normal_color = 'rgb(191, 78, 79)';    

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
  if (body.vertices.contacts) {
    body.vertices.contacts.forEach((contact, index) => {
      ctx.beginPath();
      ctx.strokeStyle = contact_point_color;  
      ctx.fillStyle = contact_point_color;
      ctx.arc(body.vertices.contacts[index].x, body.vertices.contacts[index].y, 1.5, 0, 2 * Math.PI, false);
      ctx.beginPath();
      ctx.moveTo(body.vertices.contacts[index].x, body.vertices.contacts[index].y);
      ctx.strokeStyle = contact_point_color;  
      ctx.fillStyle = contact_point_color;
      ctx.lineTo(body.vertices.centroid.x, body.vertices.centroid.y);
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
    });
  } 
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