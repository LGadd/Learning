const fixedTimestep = 5;
let lastUpdateTime = Date.now();
let elapsedTime = 0;

const g = 9.81;

const worldScale = 10;

function pixelsToMeters(pixels = 0){
    return pixels / worldScale;
}

function metersToPixels(meters = 0){
    return meters * worldScale;
}

const G = 1;
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
        radius = Math.random() * 25 + 25,
        density = Math.random() * 5 + 1,
        seed = Math.random() * 6.28,
        frequency = Math.random() * 0.5 + 1,
        fxMax = (Math.random() * 250) + 500,
        fyMax = (Math.random() * 250) + 125,
        color = Circle.getRandomColor()
    ){
        this.radius = radius;
        this.worldRadius = pixelsToMeters(radius);
        const area = Math.PI * this.worldRadius * this.worldRadius;
        this.mass = area * density;
        this.seed = seed;
        this.fMax = new Vector2(fxMax,fyMax);
        this.force = new Vector2(0,0);
        this.acceleration = new Vector2(0,0);
        this.velocity = new Vector2(0,0);
        this.worldPosition = new Vector2(pixelsToMeters(x),pixelsToMeters(y));
        this.pixelPosition = new Vector2(x,y);
        this.frequency = frequency;

        this.element = document.createElement("div");
        this.element.classList.add("circle");
        this.element.style.width = `${radius * 2 }px`;
        this.element.style.height = `${radius * 2 }px`;
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
    applyPhysics(delta, gravity = 9.81 , elasticity = 0.75, planetryForces = new Vector2(0,0))
    {
        this.force.setVector(
            Math.sin(elapsedTime * this.frequency + this.seed) * this.fMax.x, 
            Math.cos(elapsedTime * this.frequency + this.seed) * this.fMax.y
        );

        this.force.add(planetryForces);
    
        this.acceleration.setVector(
            this.force.x / this.mass, 
            this.force.y / this.mass + Math.sin(Math.cos(elapsedTime*this.frequency + this.seed)*this.frequency + this.seed) * gravity
        );
        
        this.velocity.addScale(this.acceleration.clone(),delta);
        this.worldPosition.addScale(this.velocity.clone(),delta);
        this.pixelPosition.setVector(metersToPixels(this.worldPosition.x),metersToPixels(this.worldPosition.y));

        this.checkBounds(elasticity);
        this.render();
    }

    checkBounds(elasticity)
    {
        const width = window.innerWidth;
        const height = window.innerHeight;

        const r = this.radius * 2;

        var leftBoundBreached = this.pixelPosition.x < 0;
        var rightBoundBreached = this.pixelPosition.x + r > width; 

        if(leftBoundBreached || rightBoundBreached)
        {
            this.velocity.x *= -elasticity;

            if (rightBoundBreached) this.pixelPosition.x = width - r;
            if (leftBoundBreached) this.pixelPosition.x = 0;
            this.worldPosition.x = pixelsToMeters(this.pixelPosition.x);
        }

        var topBoundBreached = this.pixelPosition.y < 0;
        var bottomBoundBreached = this.pixelPosition.y + r > height; 
        
        if(topBoundBreached || bottomBoundBreached)
        {
            this.velocity.y *= -elasticity;

            if (bottomBoundBreached) this.pixelPosition.y = height - r;
            if (topBoundBreached) this.pixelPosition.y = 0;
            this.worldPosition.y = pixelsToMeters(this.pixelPosition.y);
        }
    }


    getCenterWorld() {
        return this.worldPosition.clone().add(new Vector2(this.worldRadius, this.worldRadius));
    }
    

    render(){
        this.element.style.left = `${this.pixelPosition.x}px`;
        this.element.style.top = `${this.pixelPosition.y}px`;
    }

}

const NUM_CIRCLES = 50;
const circles = Array.from({ length: NUM_CIRCLES }, () => new Circle());



setInterval(() => {
    const now = Date.now();
    const delta = now - lastUpdateTime;

    console.log(`Desired Timestep: ${(fixedTimestep)}ms, Actual update time: ${delta.toFixed(4)}ms`);

    lastUpdateTime = now;
    elapsedTime += delta/1000;

    for(let i = 0; i < circles.length; i ++){
        let iCircle = circles[i];
        let netForce = new Vector2(0,0);
        let iCenter = iCircle.getCenterWorld();

        for (let j = 0; j < circles.length; j++){
            if(i==j) continue;
            
            let jCircle = circles[j];
            let jCenter = jCircle.getCenterWorld();

            let dir = jCenter.clone().subtract(iCenter);

            let dist = dir.magnitude();

            let minDist = iCircle.worldRadius + jCircle.worldRadius;
            if(dist < minDist) dist = minDist;

            let forceMag = G * ((iCircle.mass * jCircle.mass) / (dist * dist));

            dir.normalize().scale(forceMag);
            netForce.add(dir);
        }
        iCircle.applyPhysics(delta/1000, g, elasticity, netForce);
    }

}, fixedTimestep);
   




