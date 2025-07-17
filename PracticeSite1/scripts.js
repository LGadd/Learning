const fixedTimestep = 20;
let lastUpdateTime = Date.now();
let elapsedTime = 0;

const g = 9.81;
const G = 0.15;
let elasticity = 0.75;

class Vector2
{
    constructor(x=0,y=0) 
    { 
        this.x = x; 
        this.y = y; 
    }

    setVector(x,y){this.x = x; this.y = y; return this;}
    clone(){return new Vector2(this.x,this.y)};
    zero(){ this.x = 0; this.y = 0; return this;}

    add(v){ this.x += v.x; this.y += v.y; return this;}
    subtract(v){ this.x -= v.x; this.y -= v.y; return this;}
    scale(scalar){ this.x *= scalar; this.y *= scalar; return this;}
    addScale(v,scalar){this.x += v.x * scalar; this.y += v.y * scalar; return this;}
    
    magnitude(){ return Math.sqrt(this.x * this.x + this.y * this.y);}
    normalize()
    {
        const mag = this.magnitude();
        if(mag > 0) this.scale(1/mag);
        return this;
    }
}

class Circle {
    constructor(
        x = Math.random() * 1280,
        y = Math.random() * 720,
        radius = Math.random() * 65 + 10,
        density = Math.random() * 0.5 + 0.5,
        seed = Math.random() * 6.28,
        frequency = Math.random() + 0.5,
        fxMax = Math.random() * 50000 + 15000,
        fyMax = Math.random() * (100000 + 25000) * 2,
        color = Circle.getRandomColor()
    ){
        this.radius = radius;
        this.mass = Math.PI * radius * radius * density;
        this.seed = seed;
        this.fMax = new Vector2(fxMax,fyMax);
        this.force = new Vector2(0,0);
        this.acceleration = new Vector2(0,0);
        this.velocity = new Vector2(0,0);
        this.position = new Vector2(x,y);
        this.frequency = frequency;

        this.element = document.createElement("div");
        this.element.classList.add("circle");

        this.element.style.width = `${radius * 2}px`;
        this.element.style.height = `${radius * 2}px`;
        this.element.style.backgroundColor = color;
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;

        document.body.appendChild(this.element);
    }

    static getRandomColor() {
        const colors = [
            "red", "blue", "green", "orange", "purple", "yellow", "cyan", "magenta",
            "lime", "pink", "crimson", "teal", "gold", "deepskyblue", "salmon", "orchid",
            "turquoise", "slateblue", "coral", "indigo", "violet", "lightgreen", "plum",
            "chocolate", "darkorange", "springgreen", "skyblue", "tomato", "cadetblue", "navy"
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    applyPhysics(delta, gravity = 98.1 , elasticity = 0.75, planetryForces = new Vector2(0,0))
    {
        this.force.setVector(
            Math.sin(elapsedTime * this.frequency + this.seed) * this.fMax.x, 
            Math.cos(elapsedTime * this.frequency + this.seed) * this.fMax.y
        );

        this.force.add(planetryForces);
    
        this.acceleration.setVector(
            this.force.x / this.mass, 
            this.force.y / this.mass + gravity
        );
        
        this.velocity.addScale(this.acceleration.clone(),delta);
        this.position.addScale(this.velocity.clone(),delta);

        this.checkBounds(elasticity);
        this.render();
    }

    checkBounds(elasticity)
    {
        const width = window.innerWidth;
        const height = window.innerHeight;

        const r = this.radius * 2;

        var leftBoundBreached = this.position.x < 0;
        var rightBoundBreached = this.position.x + r > width; 

        if(leftBoundBreached || rightBoundBreached)
        {
            this.velocity.x *= -elasticity;

            if (rightBoundBreached) this.position.x = width - r;
            if (leftBoundBreached) this.position.x = 0;
        }

        var topBoundBreached = this.position.y < 0;
        var bottomBoundBreached = this.position.y + r > height; 
        
        if(topBoundBreached || bottomBoundBreached)
        {
            this.velocity.y *= -elasticity;

            if (bottomBoundBreached) this.position.y = height - r;
            if (topBoundBreached) this.position.y = 0;
        }
    }

    render(){
        this.element.style.left = `${this.position.x}px`;
        this.element.style.top = `${this.position.y}px`;
    }

}


const circles = [
    new Circle(),
    new Circle(),
    new Circle(),
    new Circle(),
    new Circle(),
    new Circle(),
    new Circle(),
    new Circle(),
    new Circle(),
    new Circle(),
    new Circle(),
    new Circle(),
    new Circle(),
    new Circle(),
    new Circle(),
    new Circle(),
    new Circle(),
    new Circle(),
    new Circle(),
    new Circle(),
    new Circle(),
    new Circle(),
    new Circle()
];


setInterval(() => {
    const now = Date.now();
    const delta = now - lastUpdateTime;

    console.log(`Desired Timestep: ${(fixedTimestep)}ms, Actual update time: ${delta.toFixed(4)}ms`);

    lastUpdateTime = now;
    elapsedTime += delta/1000;

    for(let i = 0; i < circles.length; i ++){
        let iCircle = circles[i];
        let netForce = new Vector2(0,0);

        for (let j = 0; j < circles.length; j++){
            if(i==j) continue;
            
            let jCircle = circles[j];

            let dir = jCircle.position.clone().subtract(iCircle.position);
            let dist = dir.magnitude();

            let minDist = iCircle.radius + jCircle.radius;
            if(dist < minDist) dist = minDist;

            let forceMag = (G * iCircle.mass * jCircle.mass) / ((dist/10) * (dist/10));

            dir.normalize().scale(forceMag);
            netForce.add(dir);
        }
        iCircle.applyPhysics(delta/1000, g, elasticity, netForce);
    }

}, fixedTimestep);
   




