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
    constructor(dudeMesh,speed, id, scene, scaling)
    {
        this.dudeMesh = dudeMesh;
        this.id = id;
        this.scene = scene;
        dudeMesh.Dude = this;

        if (speed) {
            this.speed = speed;
        } else { 
            this.speed = 1;
        }
        if (scaling) {
            this.scaling = scaling;
            this.dudeMesh.scaling = new BABYLON.Vector3(this.scaling, this.scaling, this.scaling);
        } else {
            this.scaling = 1;
        }
        if(Dude.boundingBoxParameters == undefined)
        {
            Dude.boundingBoxParameters = this.calculateBoundingBoxParameters();
        }

        this.bounder = this.createBoundingBox();
        this.bounder.dudeMesh = this.dudeMesh;
    }

    move()
    {

        if (!this.bounder) return;
        this.dudeMesh.position = new BABYLON.Vector3(this.bounder.position.x,
            this.bounder.position.y - this.scaling * Dude.boundingBoxParameters.lengthY/2.0, this.bounder.position.z);
        var tank = scene.getMeshByName("heroTank");
        var direction = tank.position.subtract(this.dudeMesh.position);
        var distance = direction.length(); //don't let dude get to tank?
        var dir = direction.normalize();
        var alpha = Math.atan2(-1 * dir.x, -1 * dir.z);
        this.dudeMesh.rotation.y = alpha;
        if(distance > 30) {
            console.log("moving");
            this.bounder.moveWithCollisions(dir.multiplyByFloats(this.speed, this.speed, this.speed));
        }

    }

    createBoundingBox()
    {
        var lengthX = Dude.boundingBoxParameters.lengthX;
        var lengthY = Dude.boundingBoxParameters.lengthY;
        var lengthZ = Dude.boundingBoxParameters.lengthZ;

        var bounder = new BABYLON.Mesh.CreateBox("bounder" + (this.id).toString(), 1, this.scene);

        bounder.scaling.x = lengthX * this.scaling;
        bounder.scaling.y = lengthY * this.scaling;
        bounder.scaling.z = lengthZ * this.scaling * 2;

        bounder.isVisible = false;

        var bounderMaterial = new BABYLON.StandardMaterial("bounderMaterial", this.scene);
        bounderMaterial.alpha = .5;
        bounder.material = bounderMaterial;
        bounder.checkCollisions = true;

        bounder.position = new BABYLON.Vector3(this.dudeMesh.position.x, this.dudeMesh.position.y + this.scaling * lengthY/2, this.dudeMesh.position.z);


        return bounder;

    }

    calculateBoundingBoxParameters()
    {
        var minX = 999999; var minY = 999999; var minZ = 999999;
        var maxX = -99999; var maxY = -99999; var maxZ = -99999;

        var children = this.dudeMesh.getChildren();

        for (var i = 0; i < children.length; i++ )
        {
            var positions = new BABYLON.VertexData.ExtractFromGeometry(children[i]).positions;
            if(!positions) continue;

            var index = 0;
            for(var j = index; j < positions.length; j +=3) {
                if (positions[j] < minX)
                    minX = positions[j];
                if( positions[j] > maxX)
                    maxX = positions[j];
            }
            index = 1;
            for(var j = index; j < positions.length; j +=3) {
                if (positions[j] < minY)
                    minY = positions[j];
                if( positions[j] > maxY)
                    maxY = positions[j];
            }
            index = 2;
            for(var j = index; j < positions.length; j +=3) {
                if (positions[j] < minZ)
                    minZ = positions[j];
                if( positions[j] > maxZ)
                    maxZ = positions[j];
            }

            var _lengthX = maxX - minX;
            var _lengthY = maxY - minY;
            var _lengthZ = maxZ - minZ;

        }

        return {lengthX : _lengthX , lengthY: _lengthY , lengthZ : _lengthZ};
    }
}

class Rabbit {
    constructor(rabbitMesh, speed, id, scene, scaling) {
        this.rabbitMesh = rabbitMesh;
        this.id = id;
        this.scene = scene;
        this.scaling = .1;
        rabbitMesh.Rabbit = this;
        this.speed = 1;
        if(Rabbit.boundingBoxParameters == undefined)
        {
            Rabbit.boundingBoxParameters = this.calculateBoundingBoxParameters();
        }

        this.bounder = this.createBoundingBox();
        this.bounder.rabbitMesh = this.rabbitMesh;
    }

    move()
    {
        if (!this.bounder) return;
        this.rabbitMesh.position = new BABYLON.Vector3(this.bounder.position.x,
            this.bounder.position.y - this.scaling * Rabbit.boundingBoxParameters.lengthY/2.0, this.bounder.position.z);
        var tank = scene.getMeshByName("heroTank");
        var direction = tank.position.subtract(this.rabbitMesh.position);
        var distance = direction.length();
        var dir = direction.normalize();
        var alpha = Math.atan2(-1 * dir.x, -1 * dir.z);
        this.rabbitMesh.rotation.y = alpha + 3.15;
        if(distance > 30) {
            this.bounder.moveWithCollisions(dir.multiplyByFloats(this.speed, this.speed, this.speed));
        }
    }

    createBoundingBox()
    {
        var lengthX = Rabbit.boundingBoxParameters.lengthX;
        var lengthY = Rabbit.boundingBoxParameters.lengthY;
        var lengthZ = Rabbit.boundingBoxParameters.lengthZ;

        var bounder = new BABYLON.Mesh.CreateBox("bounder" + (this.id).toString(), 1, this.scene);

        bounder.scaling.x = lengthX * this.scaling;
        bounder.scaling.y = lengthY * this.scaling;
        bounder.scaling.z = lengthZ * this.scaling * 2;

        bounder.isVisible = true;

        var bounderMaterial = new BABYLON.StandardMaterial("bounderMaterial", this.scene);
        bounderMaterial.alpha = .5;
        bounder.material = bounderMaterial;
        bounder.checkCollisions = true;

        bounder.position = new BABYLON.Vector3(this.rabbitMesh.position.x, this.rabbitMesh.position.y + this.scaling * lengthY/2, this.rabbitMesh.position.z);


        return bounder;

    }

    calculateBoundingBoxParameters()
    {
        var minX = 999999; var minY = 999999; var minZ = 999999;
        var maxX = -99999; var maxY = -99999; var maxZ = -99999;

        var children = this.rabbitMesh.getChildren();

        for (var i = 0; i < children.length; i++ )
        {
            var positions = new BABYLON.VertexData.ExtractFromGeometry(children[i]).positions;
            if(!positions) continue;

            var index = 0;
            for(var j = index; j < positions.length; j +=3) {
                if (positions[j] < minX)
                    minX = positions[j];
                if( positions[j] > maxX)
                    maxX = positions[j];
            }
            index = 1;
            for(var j = index; j < positions.length; j +=3) {
                if (positions[j] < minY)
                    minY = positions[j];
                if( positions[j] > maxY)
                    maxY = positions[j];
            }
            index = 2;
            for(var j = index; j < positions.length; j +=3) {
                if (positions[j] < minZ)
                    minZ = positions[j];
                if( positions[j] > maxZ)
                    maxZ = positions[j];
            }

            var _lengthX = maxX - minX;
            var _lengthY = maxY - minY;
            var _lengthZ = maxZ - minZ;

        }

        return {lengthX : _lengthX , lengthY: _lengthY , lengthZ : _lengthZ};
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
        if(heroDude) {
            heroDude.Dude.move();
        }
        if(heroRabbit) {
            heroRabbit.Rabbit.move();
        }
        if(scene.dudes) {
            for(var q = 0; q< scene.dudes.length; q++) {
                scene.dudes[q].Dude.move();
            }
        }
        if(scene.rabbits) {
            for(var q = 0; q< scene.rabbits.length; q++) {
                scene.rabbits[q].Rabbit.move();
            }
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
        
        scene.beginAnimation(skeletons[0],0,120,true,1.0);
        var hero = new Dude(heroDude, 2, -1, scene,.2);

        scene.dudes = [];
        for ( var q = 0; q< 10; q++) {
            scene.dudes[q] = DoClone(heroDude, skeletons, q);
            scene.beginAnimation(scene.dudes[q].skeleton, 0, 120, true, 1.0);
            var temp = new Dude(scene.dudes[q], 2, q, scene, .2);

        }
    }

}

function createHeroRabbit(scene)
{
    BABYLON.SceneLoader.ImportMesh("", "models/Rabbit/", "Rabbit.babylon", scene, function (meshes, particleSystems, skeletons) {          
        meshes[0].position = new BABYLON.Vector3(0,0,100);
        meshes[0].name = "heroRabbit";
        var heroRabbit = meshes[0];
        heroRabbit.scaling = new BABYLON.Vector3(.1, .1, .1);
        scene.beginAnimation(skeletons[0],0,70,true,2.0);

        var rabbit = new Rabbit(heroRabbit, 2, -1, scene, .2);

        scene.rabbits = [];
        for (var q = 0; q < 5; q++) {
            scene.rabbits[q] = DoClone(heroRabbit, skeletons, q);
            scene.beginAnimation(scene.rabbits[q].skeleton, 0, 70, true, 2.0);
            var temp = new Rabbit(scene.rabbits[q], 2, q, scene, .1);
        }   
        
    });

}


function DoClone(original, skeletons, id) {

    var myClone;

    var xrand = Math.floor(Math.random() * 501) - 250;
    var zrand = Math.floor(Math.random() * 501) - 250;

    myClone = original.clone("clone_"+ id);
    myClone.position = new BABYLON.Vector3(xrand,0,zrand);

    if (!skeletons) {
        return myClone;
    } else {
    
        if(!original.getChildren()) {
            myClone.skeleton = skeletons[0].clone("clone_" + id + "_skeleton");
            return myClone;
        } else {
            if(skeletons.length == 1) // this means one skeleton controlling/animating all the children
            {
                var clonedSkeleton = skeletons[0].clone("clonde_" + id + "_skeleton");
                myClone.skeleton = clonedSkeleton;
                var numChildren = myClone.getChildren().length;
                for(var i = 0; i < numChildren; i++) {
                    myClone.getChildren()[i].skeleton = clonedSkeleton;
                }
                return myClone;
            }
            else if (skeletons.length == original.getChildren().length)
            {
                for ( var i = 0; i < myClone.getChildren().length; i++)
                { //Most probably each child has its own skeleton
                    myClone.getChildren()[i].skeleton = skeletons[i].clone("clone_" + id +"_skeleton_"+i);
                }
                return myClone;
            }
        }
    }

    return myClone;

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