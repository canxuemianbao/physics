export class Vector {
  public x:number = 0;
  public y:number = 0;
  constructor(x:number, y:number) {
    this.x = x;
    this.y = y;
  }

  minus(vec:Vector) {
    return new Vector(this.x - vec.x, this.y - vec.y);
  }

  add(vec:Vector) {
    return new Vector(this.x + vec.x, this.y + vec.y);
  }

  dot_product(vec:Vector | Point) {
    return this.x * vec.x + this.y * vec.y;
  }

  cross(vec:Vector) {
    return (this.x * vec.y) - (this.y * vec.x);
  }

  product(factor:number) {
    return new Vector(this.x * factor, this.y * factor);
  }

  perpendicular() {
    return new Vector(this.y, -this.x);
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const m = this.magnitude();
    if (m !== 0) {
      return new Vector(this.x / m, this.y / m);
    }
    return new Vector(this.x, this.y);
  }

  normal() {
    const p = this.perpendicular();
    return p.normalize();
  }

  rotate(angle:number) {
    const vector1 = new Vector(this.x * Math.cos(angle), this.x * Math.sin(angle));
    const vector2 = new Vector(-this.y * Math.sin(angle), this.y * Math.cos(angle));
    return vector1.add(vector2);
  }
}

export class Projection{
  constructor(
    public min:number,
    public max:number,
    public vec:Vector,
    private min_dot:Point,
    private max_dot:Point,
  ) {
  }

  overlaps(projection:Projection) {
    return this.max > projection.min && projection.max >= this.min;
  }

  overlap_length(projection:Projection) {
    if (!this.overlaps(projection)) {
      return 0;
    }
    const max_min = Math.max(this.min, projection.min);
    const min_max = Math.min(this.max, projection.max);
    return min_max - max_min;
  }
  
  // get contact_point(projection:Projection) {
  //   if (!this.overlaps(projection)) {
  //     return 0;
  //   }
  //   const max_min = Math.max(this.min, projection.min);
  //   const min_max = Math.min(this.max, projection.max);
  // }
}     

export class Point {
  public x:number = 0;
  public y:number = 0;
  constructor(x:number, y:number) {
    this.x = x;
    this.y = y;
  }

  distance(point:Point) {
    return Math.sqrt(Math.pow((this.x - point.x), 2) + Math.pow((this.y - point.y), 2));  
  }

  add(vector:Vector) {
    return new Point(this.x + vector.x, this.y + vector.y);
  }

  minus(point:Point):Vector;
  minus(vector:Vector):Point;  
  minus(point:Point | Vector){
    if (point instanceof Vector) {
      return new Point(this.x - point.x, this.y - point.y);
    } else {
      return new Vector(this.x - point.x, this.y - point.y);
    }
  }
}

export const origin_point = new Point(0, 0);
