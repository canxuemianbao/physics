import { Body } from './body';
import {Point, Vector} from "./utils";

export function swept(body1:Body, body2:Body) {
  const distance_bewteen = body1.pos.minus(body2.pos);
  const distance_scalar = distance_bewteen.magnitude();
  const speed_bewteen = body2.velocity.minus(body1.velocity);
  const speed_scalar = speed_bewteen.dot_product(distance_bewteen.normalize());
  if (speed_scalar * distance_scalar < 0) {
    return;
  }
  const time = distance_scalar / speed_scalar;
  console.log('distance_scalar', distance_scalar);
  console.log('speed_bewteen', distance_bewteen.normalize());
  console.log('time', time);
}
