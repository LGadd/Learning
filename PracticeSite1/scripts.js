const circle = document.getElementById("cirlce");
let positionX = 0;
let positionY = 0;
function updateCircle(xSpeed,ySpeed){
    positionX += xSpeed;
    positionY += ySpeed;
    circle.style.left = positionX + "px";
    circle.style.bottom = positionY + "px";
}
