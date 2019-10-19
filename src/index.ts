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

function main() {
    // Create two new rectangles
    const a = Polygon.Rectangle(new Vector(2,3), 1, 2);
    const b = Polygon.Rectangle(new Vector(1,3), 2, 2);
    console.log("----A----");
    console.log(a);
    console.log("----B----");
    console.log(b);
    // Check if they intersect/collide
    const collision = Calculate(a, b);
    if (collision) {
        console.log("Collision detected!")
        console.log(collision);
        return;
    }
    console.log("No collision detected!");
}

main()