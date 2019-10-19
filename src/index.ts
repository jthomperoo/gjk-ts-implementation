import { IShape, Vector, Calculate } from "./gjk";

/**
 * Implementation of IShape. Polygon is a collection of points that form a shape.
 */
class Polygon implements IShape {
    public points: Vector[];

    constructor(points: Vector[]) {
        this.points = points;
    }

    public FarthestPointInDirection(direction: Vector): Vector {
        let farthestDistance = -Infinity;
        // If there are no points, just return point 0,0
        let farthestPoint: Vector = new Vector(0,0);
        for (const point of this.points) {
            const distanceInDirection = point.Dot(direction);
            if (distanceInDirection > farthestDistance) {
                farthestPoint = point;
                farthestDistance = distanceInDirection;
            }
        }
        return farthestPoint;
    }

    // Rectangle is a static method to easily build a new Rectangle Polygon
    public static Rectangle(position: Vector, width: number, height: number): Polygon {
		const halfWidth = width/2;
		const halfHeight = height/2;
		return new Polygon([
			new Vector(position.x - halfWidth, position.y + halfHeight),
			new Vector(position.x + halfWidth, position.y + halfHeight),
			new Vector(position.x + halfWidth, position.y - halfHeight),
			new Vector(position.x - halfWidth, position.y - halfHeight),
		]);
    }
}

class Circle implements IShape {
    public radius: number;
    public center: Vector;

    constructor(radius: number, center: Vector) {
        this.radius = radius;
        this.center = center;
    }

    public FarthestPointInDirection(direction: Vector): Vector {
        const angle = Math.atan2(direction.y, direction.x);
        return new Vector(
            this.center.x + (this.radius * Math.cos(angle)),
            this.center.y + (this.radius * Math.sin(angle))
        );
    }
}

function main() {
    // Create two new rectangles
    const a = new Polygon([
        new Vector(0,1),
        new Vector(1,-2),
        new Vector(-1,-1)
    ]);
    const b = new Polygon([
        new Vector(0,-1),
        new Vector(1,1),
        new Vector(-1,1)
    ]);
    console.log("----A----");
    console.log(a);
    console.log("----B----");
    console.log(b);

    // Check if they intersect/collide
    const collisionAB = Calculate(a, b);
    if (collisionAB) {
        console.log("Collision detected between A and B!")
    }
    else {
        console.log("No collision detected between A and B!");
    }

    const c = new Circle(
        2,
        new Vector(0,1)
    );
    console.log("----C----");
    console.log(c);

    // Check if they intersect/collide
    const collisionAC = Calculate(a, c);
    if (collisionAC) {
        console.log("Collision detected between A and C!")
    }
    else {
        console.log("No collision detected between A and C!");
    }

}

main()