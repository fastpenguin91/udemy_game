// your code here
var canvas;
var engine;
var scene;
document.addEventListener("DOMContentLoaded", startGame);

function startGame() {
    canvas = document.getElementById("renderCanvas");
    engine = new BABYLON.Engine(canvas, true);
    scene = createScene();
    var toRender = function () {
        scene.render();
    }
    engine.runRenderLoop(toRender);
}

var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    var ground = CreateGround(scene);

    var camera = new BABYLON.FreeCamera("freeCamera", new BABYLON.Vector3(0,0,0),scene);
    camera.attachControl(canvas);
    camera.position.y = 5000;
    camera.checkCollisions = true;
    camera.applyGravity = true; // prevents camera from flying.

    var light0 = new BABYLON.DirectionalLight("dir0", new BABYLON.Vector3(-.1, -1, 0),scene);
    
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

window.addEventListener("resize", function () {
    engine.resize();
});


