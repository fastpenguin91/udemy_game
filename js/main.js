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
    scene.clearColor = new BABYLON.Color3(1, 0, 1);
    // Code here
    var sphere = BABYLON.Mesh.CreateSphere("mySphere",32,2,scene);
    var ground = BABYLON.Mesh.CreateGround("myGround",20,20,50, scene); 
    var camera = new BABYLON.FreeCamera("myCamera", new BABYLON.Vector3(0, 0, -10), scene);
    camera.attachControl(canvas);
    var light = new BABYLON.PointLight('myPointLight', new BABYLON.Vector3(0,10,0), scene );
    light.intensity = .5;
    light.diffuse = new BABYLON.Color3(1,0,0);
    
    return scene;
};

window.addEventListener("resize", function () {
    engine.resize();
});


