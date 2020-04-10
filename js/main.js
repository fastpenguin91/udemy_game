// your code here
var canvas;
var engine;
var scene;
var isWPressed = false;
var isSPressed = false;
var isAPressed = false;
var isEPressed = false;
document.addEventListener("DOMContentLoaded", startGame);

class Dude {
    constructor(dudeMesh,speed)
    {
        this.dudeMesh = dudeMesh;
        dudeMesh.Dude = this;
        if (speed)
            this.speed = speed;
        else 
            this.speed = 1;
    }

    move()
    {
        var tank = scene.getMeshByName("heroTank");
        var direction = tank.position.subtract(this.dudeMesh.position);
        var distance = direction.length(); //don't let dude get to tank?
        var dir = direction.normalize();
        var alpha = Math.atan2(-1 * dir.x, -1 * dir.z);
        this.dudeMesh.rotation.y = alpha;
        if(distance > 30) {
            //console.log("moving");
            this.dudeMesh.moveWithCollisions(dir.multiplyByFloats(this.speed, this.speed, this.speed));
        } else {
            //console.log("not moving");
        }

    }
}

class Rabbit {
    constructor(rabbitMesh) {
        this.rabbitMesh = rabbitMesh;
        rabbitMesh.Rabbit = this;
        this.speed = 1;
    }

    move()
    {
        var tank = scene.getMeshByName("heroTank");
        var direction = tank.position.subtract(this.rabbitMesh.position);
        var distance = direction.length();
        var dir = direction.normalize();
        var alpha = Math.atan2(-1 * dir.x, -1 * dir.z);
        this.rabbitMesh.rotation.y = alpha + 3.15;
        if(distance > 30) {
            this.rabbitMesh.moveWithCollisions(dir.multiplyByFloats(this.speed, this.speed, this.speed));
        }
    }
}

class Car {
    constructor(carMesh) {
        this.carMesh = carMesh;
        carMesh.Car = this;
        this.speed = 1;
    }

    move()
    {
        console.log("in car move()");
        var tank = scene.getMeshByName("heroTank");
        var direction = tank.position.subtract(this.carMesh.position);
        var distance = direction.length();
        var dir = direction.normalize();
        var alpha = Math.atan2(-1 * dir.x, -1 * dir.z);
        this.carMesh.rotation.y = alpha + 3.15;
        if(distance > 30) {
            this.carMesh.moveWithCollisions(dir.multiplyByFloats(this.speed, this.speed, this.speed));
        }
    }
}


function startGame() {
    canvas = document.getElementById("renderCanvas");
    engine = new BABYLON.Engine(canvas, true);
    scene = createScene();
    modifySettings();
    var tank = scene.getMeshByName("heroTank");
    var toRender = function () {
        tank.move();
        var heroDude = scene.getMeshByName("heroDude");
        var heroRabbit = scene.getMeshByName("heroRabbit");
        var heroCar = scene.getMeshByName("heroCar");
        if(heroDude) {
            heroDude.Dude.move();
        }
        if(heroRabbit) {
            console.log("rabbit moving");
            heroRabbit.Rabbit.move();
        }
        if(heroCar) {
            console.log("car moving");
            heroCar.Car.move();
        }


        scene.render();
    }
    engine.runRenderLoop(toRender);
}

var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    var ground = CreateGround(scene);
    var freeCamera = createFreeCamera(scene);
    var tank = createTank(scene);
    var followCamera = createFollowCamera(scene, tank);
    scene.activeCamera = followCamera;
    createLights(scene);
    createHeroDude(scene);
    createHeroRabbit(scene);
    createHeroCar(scene);


    return scene;
};

function CreateGround(scene)
{
    var ground = new BABYLON.Mesh.CreateGroundFromHeightMap("ground","images/hmap1.png", 2000,2000,20,0,1000,scene,false,OnGroundCreated);
    function OnGroundCreated()
    {
        var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("images/grass.jpg", scene);
        ground.material = groundMaterial;
        ground.checkCollisions = true;
    }
    return ground;
}

function createLights(scene){
    var light0 = new BABYLON.DirectionalLight("dir0", new BABYLON.Vector3(-.1, -1, 0), scene);
    var light1 = new BABYLON.DirectionalLight("dir1", new BABYLON.Vector3(-1, -1, 0), scene);
}

function createFreeCamera(scene)
{
    var camera = new BABYLON.FreeCamera("freeCamera", new BABYLON.Vector3(0,0,0),scene);
    camera.attachControl(canvas);
    camera.position.y = 500;
    camera.checkCollisions = true;
    camera.applyGravity = true; // prevents camera from flying.
    camera.keysUp.push('w'.charCodeAt(0));
    camera.keysUp.push('W'.charCodeAt(0));
    camera.keysDown.push('s'.charCodeAt(0));
    camera.keysDown.push('S'.charCodeAt(0));
    camera.keysRight.push('e'.charCodeAt(0));
    camera.keysRight.push('E'.charCodeAt(0));
    camera.keysLeft.push('a'.charCodeAt(0));
    camera.keysLeft.push('A'.charCodeAt(0));

    return camera;
}

function createFollowCamera(scene,target)
{
    var camera = new BABYLON.FollowCamera("tankFollowCamera", target.position, scene, target);
    camera.radius = 20; //how far from object to follow
    camera.heightOffset = 4; // how high above object to place camera
    camera.rotationOffset = 180; // viewing angle
    camera.cameraAcceleration = 0.5; // ow fast to move
    camera.maxCameraSpeed = 50; // speed limit
    return camera;
}

function createTank(scene)
{
    var tank = new BABYLON.MeshBuilder.CreateBox("heroTank", {height: 1, depth: 6, width:6}, scene);
    var tankMaterial = new BABYLON.StandardMaterial("tankMaterial", scene);
    tankMaterial.diffuseColor = new BABYLON.Color3.Red;
    tankMaterial.emissiveColor = new BABYLON.Color3.Blue;
    tank.material = tankMaterial;
    tank.position.y += 2;
    tank.speed = 1;
    tank.frontVector = new BABYLON.Vector3(0, 0, 1);
    tank.move = function()
    {
        var yMovement = 0;
        if (tank.position.y > 2) {
            yMovement = -2;
        }
        if (isWPressed) {
            tank.moveWithCollisions(tank.frontVector.multiplyByFloats(tank.speed, tank.speed,tank.speed));
        }
        if (isSPressed) {
            tank.moveWithCollisions(tank.frontVector.multiplyByFloats(-1 * tank.speed, -1 * tank.speed, -1 * tank.speed));
        }
        if (isAPressed) {
            tank.rotation.y -= .1;
            tank.frontVector = new BABYLON.Vector3(Math.sin(tank.rotation.y),0,Math.cos(tank.rotation.y));
        }
        if (isEPressed) {
            tank.rotation.y += .1;
            tank.frontVector = new BABYLON.Vector3(Math.sin(tank.rotation.y),0,Math.cos(tank.rotation.y));
        }
        
    }
    return tank;
}

function createHeroDude(scene)
{

    BABYLON.SceneLoader.ImportMesh("him", "models/Dude/", "Dude.babylon", scene, onDudeImported);
    function onDudeImported(newMeshes, particleSystems, skeletons) {
        newMeshes[0].position = new BABYLON.Vector3(0,0,5); // the original dude
        newMeshes[0].name = "heroDude";
        var heroDude = newMeshes[0];
        heroDude.scaling = new BABYLON.Vector3(.2,.2,.2);
        heroDude.speed = 2;
        scene.beginAnimation(skeletons[0],0,120,true,1.0);

        var hero = new Dude(heroDude, 2);
    }

}


function createHeroRabbit(scene)
{
    BABYLON.SceneLoader.ImportMesh("", "models/Rabbit/", "Rabbit.babylon", scene, function (meshes, particleSystems, skeletons) {          
        meshes[0].position = new BABYLON.Vector3(0,0,100);
        meshes[0].name = "heroRabbit";
        var heroRabbit = meshes[0];
        scene.beginAnimation(skeletons[0],0,70,true,2.0);

        var rabbit = new Rabbit(heroRabbit);
        
    });

}

function createHeroCar(scene)
{
    BABYLON.SceneLoader.ImportMesh("", "models/Low-Poly-Racing-Car/", "Low-Poly-Racing-Car.babylon", scene, function (meshes, particleSystems, skeletons) {          
        meshes[0].position = new BABYLON.Vector3(0,4,50);
        meshes[0].name = "heroCar";
        meshes[0].scaling = new BABYLON.Vector3(.08, .08, .08);

        var heroCar = meshes[0];
        //scene.beginAnimation(skeletons[0],0,70,true,2.0);

        var car = new Car(heroCar);
    });

}




window.addEventListener("resize", function () {
    engine.resize();
});

function modifySettings() {

    scene.onPointerDown = function()
    {
        if(!scene.alreadyLocked) {
            canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock ||
            canvas.webkitRequestPointerLock;
            canvas.requestPointerLock();
            
            //canvas.requestPointerLock(); // allows aiming via pointer
        } else {
            console.log("not requesting because we ar ealready locked");
        }
       
    }

    document.addEventListener("pointerlockchange", pointerLockListener);
    document.addEventListener("mspointerlockchange", pointerLockListener);
    document.addEventListener("mozpointerlockchange", pointerLockListener);
    document.addEventListener("webkitpointerlockchange", pointerLockListener);

    function pointerLockListener()
    {
        var element = document.pointerLockElement || document.webkitPointerLockElement || document.msPointerLockElement || document.pointerLockElement || null;

        if (element){
            scene.alreadyLocked = true;
        } else {
            scene.alreadyLocked = false;
        }

    }

}


document.addEventListener("keydown", function(event)
{
    if(event.key == 'w' || event.key == 'W')
    {
        isWPressed = true;
    }
    if(event.key == 's' || event.key == 'S')
    {
        isSPressed = true;
    }
    if(event.key == 'a' || event.key == 'A')
    {
        isAPressed = true;
    }
    if(event.key == 'e' || event.key == 'E')
    {
        isEPressed = true;
    }
});

document.addEventListener("keyup", function(event)
{
    if(event.key == 'w' || event.key == 'W')
    {
        isWPressed = false;
    }
    if(event.key == 's' || event.key == 'S')
    {
        isSPressed = false;
    }
    if(event.key == 'a' || event.key == 'A')
    {
        isAPressed = false;
    }
    if(event.key == 'e' || event.key == 'E')
    {
        isEPressed = false;
    }
})