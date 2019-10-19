/**
 * Vector is the representation of a 2D vector with some functions to manipulate and
 * create new vectors. All functions create new Vectors and are not in place.
 */
class Vector {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public Add(vector: Vector): Vector {
        return new Vector(
            this.x + vector.x,
            this.y + vector.y
        );
    }

    public Sub(vector: Vector): Vector {
        return new Vector(
            this.x - vector.x,
            this.y - vector.y
        );
    }

    public Dot(vector: Vector): number {
        return this.x * vector.x + this.y * vector.y;
    }

    public Invert(): Vector {
        return new Vector(
            -this.x,
            -this.y
        );
    }
}

/**
 * IShape is an interface that defines what a shape needs to implement in order for it to
 * be used with the GJK algorithm
 */
interface IShape {
    FarthestPointInDirection(direction: Vector): Vector;
}

/**
 * Collision is a simple structure that holds two shapes that have collided
 */
class Collision {
    public a: IShape;
    public b: IShape;
    constructor(a: IShape, b: IShape) {
        this.a = a;
        this.b = b;
    }
}

/**
 * Simplex is a structure that defines a collection of points, designed to encapsulate the
 * origin. A simplex can only have up to 3 points. Uses the current state of its points to
 * determine the direction that should be searched next for the best chance at building up
 * a simplex around the origin. If the origin is already contained in the simplex it will
 * not output a new direction to search in.
 */
class Simplex {
    private points: Vector[];
    constructor() {
        this.points = [];
    }

    Add(point: Vector): void {
        this.points.push(point);
    }

    /**
     * CalculateDirection does two things, first it checks if the origin already lies within
     * the current simplex, if so it will return undefined for the new direction. Second it
     * determines the direction to get the next support point from if the origin is not 
     * within the current simplex and returns it. It will also clear room for a new
     * support point to be calculated and added to the Simplex.
     */
    CalculateDirection(): Vector | undefined {
        // Get a, the last point added to the simplex
        const a = this.points[this.points.length - 1];
        // Since a was just added, we know that the inverse of a points 
        // towards the origin
        const ao = a.Invert();
        // If the simplex is a triangle
        if (this.points.length == 3) {
            // B is the penultimate in the simplex
            // C is the oldest point in the simplex
            const b = this.points[1];
            const c = this.points[0];

            // Determine a->b and a->c lines
            const ab = b.Sub(a);
            const ac = c.Sub(a);

            // Determine perpendicular of the a->b line
            let abPerp = new Vector(ab.y, -ab.x);

            // Check the handedness of the perpendicular, it should
            // face AWAY from the simplex
            if (abPerp.Dot(c) >= 0) {
                abPerp = abPerp.Invert();
            }

            // If the origin lies outside of the simplex remove the
            // point and determine a new direction in the direction
            // of the perpendicular; aiming to try to encapsulate
            // the origin that lies outside
            if (abPerp.Dot(ao) > 0) {
                this.points.splice(0, 1);
                return abPerp;
            }

            // Determine perpendicular of the a->c line
            let acPerp = new Vector(ac.y, -ac.x);

            // Check the handedness of the perpendicular, it should
            // face AWAY from the simplex
            if (acPerp.Dot(b) >= 0) {
                acPerp = acPerp.Invert();
            }

            // If the origin lies outside of the simplex remove the
            // point and determine a new direction in the direction
            // of the perpendicular; aiming to try to encapsulate
            // the origin that lies outside
            if (acPerp.Dot(ao) > 0) {
                this.points.splice(1, 1);
                return acPerp;
            }
            return undefined;
        }
        // Otherwise the simplex is just a line
        // B is the penultimate point in the simplex,
        // in this case the other end of the line
        const b = this.points[0];
        // Determine a -> b line
        const ab = b.Sub(a);

        // Get the perpendicular of the a->b line
        let abPerp = new Vector(ab.y, -ab.x);

        // Check the handedness of the perpendicular, it should
        // face TOWARDS the origin
        if (abPerp.Dot(ao) <= 0) {
            abPerp = abPerp.Invert();
        }
        return abPerp;
    }
}

/**
 * support is a function used to determine the support point of two shapes in a direction. The
 * support point is a way to calculate a point on the edge of a Minkowski Difference without
 * having to calculate the entire Minkowski Difference.
 */
function support(a: IShape, b: IShape, direction: Vector): Vector {
    const aFar = a.FarthestPointInDirection(direction);
    const bFar = b.FarthestPointInDirection(direction.Invert());
    return aFar.Sub(bFar);
}

/**
 * Calculate determines if two shapes are intersecting/colliding using the GJK algorithm.
 * If they intersect, a Collision is returned. If they do not intersect, undefined is 
 * returned.
 */
function Calculate(a: IShape, b: IShape): Collision | undefined {
    // Build a new Simplex for determining if a collision has occurred
    const simplex = new Simplex();

    // Choose an arbitrary starting direction
    let direction: Vector | undefined = new Vector(0,1);

    // Get the first support point and add it to the simplex
    const initSupportPoint = support(a, b, direction);
    simplex.Add(initSupportPoint);

    // Flip the direction for the next support point
    direction = direction.Invert();

    // Keep iterating until the direction is undefined, this will occur when
    // 'CalculateDirection' doesn't return a direction, indicating that an 
    // intersection has been detected
    while(direction) {
        const supportPoint = support(a, b, direction);

        // If the support point did not reach as far as the origin,
        // the simplex must not contain the origin and therefore there is no
        // intersection
        if (supportPoint.Dot(direction!) <= 0) {
            // No intersection
            return;
        }

        // Add the simplex and determine a new direction
        simplex.Add(supportPoint);
        direction = simplex.CalculateDirection();
    }
    // No direction calculated, intersection detected
    return new Collision(a, b);
}

export { Vector, IShape, Calculate, Collision };