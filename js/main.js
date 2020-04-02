// your code here
var canvas;
var engine;
var scene;
document.addEventListener("DOMContentLoaded", startGame);

function startGame() {
    canvas = document.getElementById("renderCanvas");
    engine = new BABYLON.Engine(canvas, true);
    scene = createScene();
    modifySettings();
    var tank = scene.getMeshByName("HeroTank");
    var toRender = function () {
        var yMovement = 0;
        console.log(tank.position.y);
        if (tank.position.y > 2)
        {
            //console.log("well i am bigger than 2");
            yMovement = -2;
        }
        //tank.position.z -= 1; // this movement does not respect collisions
        tank.moveWithCollisions(new BABYLON.Vector3(0,yMovement,5));
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
    var tank = new BABYLON.MeshBuilder.CreateBox("HeroTank", {height: 1, depth: 6, width:6}, scene);
    var tankMaterial = new BABYLON.StandardMaterial("tankMaterial", scene);
    tankMaterial.diffuseColor = new BABYLON.Color3.Red;
    tankMaterial.emissiveColor = new BABYLON.Color3.Blue;
    tank.material = tankMaterial;

    tank.position.y += 2;
    return tank;
}

window.addEventListener("resize", function () {
    engine.resize();
});

function modifySettings() {

    scene.onPointerDown = function()
    {
        if(!scene.alreadyLocked) {
            console.log("Requesting pointer lock");
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