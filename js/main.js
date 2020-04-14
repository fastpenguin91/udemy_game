// your code here
var canvas;
var engine;
var scene;
var isWPressed = false;
var isSPressed = false;
var isAPressed = false;
var isEPressed = false;
var isBPressed = false;
var isRPressed = false;
document.addEventListener("DOMContentLoaded", startGame);

class Dude {
    constructor(dudeMesh,speed, id, scene, scaling)
    {
        this.dudeMesh = dudeMesh;
        this.id = id;
        this.scene = scene;
        this.health = 3;
        this.frontVector = new BABYLON.Vector3(0,0, -1);
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
        if(Dude.boundingBoxParameters == undefined) {
            Dude.boundingBoxParameters = this.calculateBoundingBoxParameters();
        }
        if (Dude.particleSystem == undefined) {
            Dude.particleSystem = this.createDudeParticleSystem();
        }

        this.bounder = this.createBoundingBox();
        this.bounder.dudeMesh = this.dudeMesh;
    }

    followTank()
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
            this.bounder.moveWithCollisions(dir.multiplyByFloats(this.speed, this.speed, this.speed));
        }

    }

    moveFPS() {
        //console.log("moving dude manually");
        if(scene.activeCamera != scene.followCameraDude)
        {
            //console.log("dudeMesh: ");
            //console.log(this.dudeMesh);
            this.dudeMesh.animatableObject.pause();
            return;
        }
        if(isWPressed || isSPressed)
        {
            this.dudeMesh.animatableObject.restart();
            //console.log("dudes 0: ");
            //console.log(scene.dudes[0]);

            //console.log("dudes 1: ");
            //console.log(scene.dudes[1]);
        }
        else
        {
            this.dudeMesh.animatableObject.pause();
        }

        if (!this.bounder) return;
        this.dudeMesh.position = new BABYLON.Vector3(this.bounder.position.x,
            this.bounder.position.y - this.scaling * Dude.boundingBoxParameters.lengthY/2.0, this.bounder.position.z);

        var direction = this.frontVector;
        var dir = direction.normalize();
        var alpha = Math.atan2(-1 * dir.x, -1 * dir.z);
        this.dudeMesh.rotation.y = alpha;
        if(isWPressed) {
            this.bounder.moveWithCollisions(this.frontVector.multiplyByFloats(this.speed, this.speed, this.speed));
        }
        if(isSPressed) {
            this.bounder.moveWithCollisions(this.frontVector.multiplyByFloats(-1 * this.speed, -1 * this.speed, -1 * this.speed));
        }
        if(isEPressed)
        {
            var alpha = this.dudeMesh.rotation.y;
            alpha+= .1;
            this.frontVector = new BABYLON.Vector3(-1 * Math.sin(alpha), 0, -1 * Math.cos(alpha));
        }
        if(isAPressed)
        {
            var alpha = this.dudeMesh.rotation.y;
            alpha -= .1;
            this.frontVector = new BABYLON.Vector3(-1 * Math.sin(alpha), 0, -1 * Math.cos(alpha));
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

    createDudeParticleSystem = function()
    {
        // create a particle system
        var particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);

        // Texture of each particle
        particleSystem.particleTexture = new BABYLON.Texture("images/flare.png", scene);

        // where particles come from
        particleSystem.emitter = new BABYLON.Vector3(0,0,0); // starting object, the emitter

        //colors of all particles
        particleSystem.color1 = new BABYLON.Color4(1, 0, 0, 1.0);
        particleSystem.color2 = new BABYLON.Color4(1, 0, 0, 1.0);
        particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);

        particleSystem.emitRate = 100;

        // set the gravity of all particles
        particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);

        // Direction of each particle after it has been emitted
        particleSystem.direction1 = new BABYLON.Vector3(0, -1, 0);
        particleSystem.direction2 = new BABYLON.Vector3(0, -1, 0);

        particleSystem.minEmitPower = 6;
        particleSystem.maxEmitPower = 10;

        return particleSystem;
    }

    decreaseHealth(hitPoint)
    {
        Dude.particleSystem.emitter = hitPoint;
        this.health--;
        Dude.particleSystem.start();
        setTimeout(function() {
            Dude.particleSystem.stop();
        }, 300);
        if(this.health <= 0)
        {
            this.gotKilled();
        }
    }

    gotKilled() {
        scene.assets["dieSound"].play();
        Dude.particleSystem.emitter = this.bounder.position;
        Dude.particleSystem.emitRate = 2000;

        Dude.particleSystem.minEmitBox = new BABYLON.Vector3(-1, 0, -1);
        Dude.particleSystem.maxEmitBox = new BABYLON.Vector3(1, 0, 1);

        // Direction of each particle after it has been emitted
        Dude.particleSystem.direction1 = new BABYLON.Vector3(0, 1, 0);
        Dude.particleSystem.direction2 = new BABYLON.Vector3(0, -1, 0);

        Dude.particleSystem.start();
        setTimeout(function () {
            Dude.particleSystem.stop();
        }, 300);

        this.bounder.dispose();
        this.dudeMesh.dispose();
    }

}


class Rabbit {
    constructor(rabbitMesh, speed, id, scene, scaling) {
        //console.log(rabbitMesh.scaling);
        this.rabbitMesh = rabbitMesh;
        this.id = id;
        this.scene = scene;
        this.scaling = .1;
        this.frontVector = new BABYLON.Vector3(0,0,-1);
        rabbitMesh.Rabbit = this;
        this.speed = 1;
        if(Rabbit.boundingBoxParameters == undefined)
        {
            Rabbit.boundingBoxParameters = this.calculateBoundingBoxParameters();
        }

        this.bounder = this.createBoundingBox();
        this.bounder.rabbitMesh = this.rabbitMesh;
    }

    followTank()
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

    moveFPS() {

        if(scene.activeCamera != scene.followCameraRabbit)
        {
            this.rabbitMesh.animatableObject.pause();
            return;
        }
        if(isWPressed || isSPressed)
        {
            this.rabbitMesh.animatableObject.restart();
        }
        else
        {
            this.rabbitMesh.animatableObject.pause();
        }

        this.rabbitMesh.position = new BABYLON.Vector3(this.bounder.position.x,
            this.bounder.position.y - this.scaling * Rabbit.boundingBoxParameters.lengthY/2.0, this.bounder.position.z);

        var direction = this.frontVector;
        var dir = direction.normalize();
        var alpha = Math.atan2(-1 * dir.x, -1 * dir.z);
        this.rabbitMesh.rotation.y = alpha;
        if(isWPressed) {
            this.bounder.moveWithCollisions(this.frontVector.multiplyByFloats(-1 * this.speed, -1 * this.speed, -1 * this.speed));
            //this.bounder.moveWithCollisions(this.frontVector.multiplyByFloats(this.speed, this.speed, this.speed));
        }
        if(isSPressed) {
            this.bounder.moveWithCollisions(this.frontVector.multiplyByFloats(this.speed, this.speed, this.speed));
            //this.bounder.moveWithCollisions(this.frontVector.multiplyByFloats(-1 * this.speed, -1 * this.speed, -1 * this.speed));
        }
        if(isEPressed)
        {
            var alpha = this.rabbitMesh.rotation.y;
            alpha+= .1;
            this.frontVector = new BABYLON.Vector3(-1 * Math.sin(alpha), 0, -1 * Math.cos(alpha));
        }
        if(isAPressed)
        {
            var alpha = this.rabbitMesh.rotation.y;
            alpha -= .1;
            this.frontVector = new BABYLON.Vector3(-1 * Math.sin(alpha), 0, -1 * Math.cos(alpha));
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

class Car {
    constructor(carMesh, speed, id, scene, scaling) {
        console.log(carMesh.scaling);
        this.carMesh = carMesh;
        this.id = id;
        this.scene = scene;
        this.scaling = .08;
        this.frontVector = new BABYLON.Vector3(0,0,-1);
        carMesh.Car = this;
        this.speed = 1;
        if(Car.boundingBoxParameters == undefined)
        {
            Car.boundingBoxParameters = this.calculateBoundingBoxParameters();
        }

        this.bounder = this.createBoundingBox();
        this.bounder.carMesh = this.carMesh;
    }

    followTank()
    {
        if (!this.bounder) return;
        this.carMesh.position = new BABYLON.Vector3(this.bounder.position.x,
            this.bounder.position.y - this.scaling * Car.boundingBoxParameters.lengthY/2.0, this.bounder.position.z);
        var tank = scene.getMeshByName("heroTank");
        var direction = tank.position.subtract(this.carMesh.position);
        var distance = direction.length();
        var dir = direction.normalize();
        var alpha = Math.atan2(-1 * dir.x, -1 * dir.z);
        this.carMesh.rotation.y = alpha + 3.15;
        if(distance > 30) {
            this.bounder.moveWithCollisions(dir.multiplyByFloats(this.speed, this.speed, this.speed));
        }
    }

    moveFPS() {

        if(scene.activeCamera != scene.followCameraCar)
        {
            //this.carMesh.animatableObject.pause();
            return;
        }
        if(isWPressed || isSPressed)
        {
            //this.carMesh.animatableObject.restart();
        }
        else
        {
            //this.rabbitMesh.animatableObject.pause();
        }

        this.carMesh.position = new BABYLON.Vector3(this.bounder.position.x,
            this.bounder.position.y - this.scaling * Car.boundingBoxParameters.lengthY/2.0, this.bounder.position.z);

        var direction = this.frontVector;
        var dir = direction.normalize();
        var alpha = Math.atan2(-1 * dir.x, -1 * dir.z);
        this.carMesh.rotation.y = alpha;
        if(isWPressed) {
            //this.bounder.moveWithCollisions(this.frontVector.multiplyByFloats(-1 * this.speed, -1 * this.speed, -1 * this.speed));
            this.bounder.moveWithCollisions(this.frontVector.multiplyByFloats(this.speed, this.speed, this.speed));
        }
        if(isSPressed) {
            //this.bounder.moveWithCollisions(this.frontVector.multiplyByFloats(this.speed, this.speed, this.speed));
            this.bounder.moveWithCollisions(this.frontVector.multiplyByFloats(-1 * this.speed, -1 * this.speed, -1 * this.speed));
        }
        if(isEPressed)
        {
            var alpha = this.carMesh.rotation.y;
            alpha+= .1;
            this.frontVector = new BABYLON.Vector3(-1 * Math.sin(alpha), 0, -1 * Math.cos(alpha));
        }
        if(isAPressed)
        {
            var alpha = this.carMesh.rotation.y;
            alpha -= .1;
            this.frontVector = new BABYLON.Vector3(-1 * Math.sin(alpha), 0, -1 * Math.cos(alpha));
        }


    }

    createBoundingBox()
    {
        var lengthX = Car.boundingBoxParameters.lengthX;
        var lengthY = Car.boundingBoxParameters.lengthY;
        var lengthZ = Car.boundingBoxParameters.lengthZ;

        var bounder = new BABYLON.Mesh.CreateBox("bounder" + (this.id).toString(), 1, this.scene);

        bounder.scaling.x = lengthX * this.scaling;
        bounder.scaling.y = lengthY * this.scaling;
        bounder.scaling.z = lengthZ * this.scaling * 2;

        bounder.isVisible = true;

        var bounderMaterial = new BABYLON.StandardMaterial("bounderMaterial", this.scene);
        bounderMaterial.alpha = .5;
        bounder.material = bounderMaterial;
        bounder.checkCollisions = true;

        bounder.position = new BABYLON.Vector3(this.carMesh.position.x, this.carMesh.position.y + this.scaling * lengthY/2, this.carMesh.position.z);


        return bounder;

    }

    calculateBoundingBoxParameters()
    {
        var minX = 999999; var minY = 999999; var minZ = 999999;
        var maxX = -99999; var maxY = -99999; var maxZ = -99999;

        var children = this.carMesh.getChildren();

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
    scene.toRender = function () {
        tank.move();
        tank.fireCannonBalls();
        tank.fireLaserBeams();
        moveHeroDude();
        moveHeroRabbit();
        moveHeroCar();
        //moveOtherDudes();
        //moveOtherRabbits();

        scene.render();
    }

    scene.assetsManager.load();
}

var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    scene.assetsManager = configureAssetsManager(scene);
    scene.enablePhysics();
    var ground = CreateGround(scene);
    var freeCamera = createFreeCamera(scene);
    var tank = createTank(scene);
    scene.followCameraTank = createFollowCamera(scene, tank);
    scene.activeCamera = scene.followCameraTank;
    createLights(scene);
    createHeroDude(scene);
    createHeroRabbit(scene);
    createHeroCar(scene);
    loadSounds(scene);

    return scene;
};

function CreateGround(scene) {
    var ground = new BABYLON.Mesh.CreateGroundFromHeightMap("ground","images/hmap1.png", 2000,2000,20,0,1000,scene,false,OnGroundCreated);

    function OnGroundCreated()
    {
        var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("images/grass.jpg", scene);
        ground.material = groundMaterial;
        ground.checkCollisions = true;
        ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground,
            BABYLON.PhysicsImpostor.HeightmapImpostor, {mass: 0}, scene);
    }
    return ground;
}

function createLights(scene){
    var light0 = new BABYLON.DirectionalLight("dir0", new BABYLON.Vector3(-.1, -1, 0), scene);
    var light1 = new BABYLON.DirectionalLight("dir1", new BABYLON.Vector3(-1, -1, 0), scene);
}

function loadSounds(scene)
{
    var assetsManager = scene.assetsManager;
    var binaryTask = assetsManager.addBinaryFileTask("laserSound", "sounds/laser.wav");
    binaryTask.onSuccess = function (task) {
        scene.assets["laserSound"] = new BABYLON.Sound("laser", task.data, scene, null, { loop: false });
    }

    binaryTask = assetsManager.addBinaryFileTask("cannonSound", "sounds/cannon.wav");
    binaryTask.onSuccess = function (task) {
        scene.assets["cannonSound"] = new BABYLON.Sound("cannon", task.data, scene, null, { loop: false });
    }

    binaryTask = assetsManager.addBinaryFileTask("dieSound", "sounds/die.wav");
    binaryTask.onSuccess = function (task) {
        scene.assets["dieSound"] = new BABYLON.Sound("die", task.data, scene, null, { loop: false });
    }

}

function configureAssetsManager(scene)
{
    scene.assets = {};
    var assetsManager = new BABYLON.AssetsManager(scene);
    assetsManager.onProgress = function (remainingCount, totalCount, lastFinishedTask) {
        engine.loadingUIText = "We are loading the scene. " + remainingCount + " out of " + " items still need to be loaded.";
    };

    assetsManager.onFinish = function (tasks) {
        engine.runRenderLoop(function () {
            scene.toRender();
        });
    };

    return assetsManager;
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
    var camera = new BABYLON.FollowCamera(target.name + "FollowCamera", target.position, scene, target);
    if(target.name == "heroDude")
    {
        camera.radius = 40; //how far from object to follow
        camera.heightOffset = 10; // how high above object to place camera
        camera.rotationOffset = 0; // viewing angle
    } else if (target.name == "heroCar") {
        camera.radius = 40;
        camera.heightOffset = 20;
        camera.rotationOffset = 0;
    } else {
        camera.radius = 20;
        camera.heightOffset = 4; // how high above object to place camera
        camera.rotationOffset = 180; // viewing angle
    }

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
    tank.canFireCannonBalls = true;
    tank.canFireLaser = true;
    //tank.isPickable = false;
    tank.move = function()
    {
        if(scene.activeCamera != scene.followCameraTank)
        {
            return;
        }
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


    tank.fireCannonBalls = function()
    {
        var tank = this;

        if(!isBPressed) return;
        if(!tank.canFireCannonBalls) return;
        tank.canFireCannonBalls = false;

        setTimeout(function() {
            tank.canFireCannonBalls = true;
        }, 500)

        scene.assets["cannonSound"].play();

        var cannonBall = new BABYLON.Mesh.CreateSphere("cannonBall", 32, 2, scene);
        cannonBall.material = new BABYLON.StandardMaterial("Fire", scene);
        cannonBall.material.diffuseTexture = new BABYLON.Texture("images/fire.jpg",scene);


        var pos = tank.position;

        cannonBall.position = new BABYLON.Vector3(pos.x, pos.y +1, pos.z);
        cannonBall.position.addInPlace(tank.frontVector.multiplyByFloats(5,5,5));

        cannonBall.physicsImpostor = new BABYLON.PhysicsImpostor(cannonBall,
            BABYLON.PhysicsImpostor.SphereImpostor, {mass : 1}, scene);

        var fVector = tank.frontVector;
        var force = new BABYLON.Vector3(fVector.x * 100, (fVector.y+.1) * 100, fVector.z * 100);
        cannonBall.physicsImpostor.applyImpulse(force, cannonBall.getAbsolutePosition());

        cannonBall.actionManager = new BABYLON.ActionManager(scene);

        scene.dudes.forEach(function(dude){

            cannonBall.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
                {
                    trigger : BABYLON.ActionManager.OnIntersectionEnterTrigger,
                    parameter: dude.Dude.bounder
                },
                function () {
                    if(dude.Dude.bounder._isDisposed) return;
                    dude.Dude.gotKilled();
                }
            ))


        });

        setTimeout(function() {
            cannonBall.dispose();
        },3000);

    }

    tank.fireLaserBeams = function()
    {
        var tank = this;
        if (!isRPressed) return;
        if (!tank.canFireLaser) return;
        tank.canFireLaser = false;

        setTimeout(function () {
            tank.canFireLaser = true;
        }, 500);

        scene.assets["laserSound"].play();
        var origin = tank.position;
        var direction = new BABYLON.Vector3(tank.frontVector.x, tank.frontVector.y + .1, tank.frontVector.z);
        var ray = new BABYLON.Ray(origin, direction,1000);
        var rayHelper = new BABYLON.RayHelper(ray);
        rayHelper.show(scene, new BABYLON.Color3.Red);

        setTimeout(function () {
            rayHelper.hide(ray);
        }, 200);

        var pickInfos = scene.multiPickWithRay(ray, function (mesh) {
            if(mesh.name == "heroTank") return false;
            return true;
        });

        for ( var i = 0; i < pickInfos.length; i++){
            var pickInfo = pickInfos[i];
            if (pickInfo.pickedMesh){
                if(pickInfo.pickedMesh.name.startsWith("bounder")) {

                    pickInfo.pickedMesh.dudeMesh.Dude.decreaseHealth(pickInfo.pickedPoint);
                } else if (pickInfo.pickedMesh.name.startsWith("clone")) {
                    pickInfo.pickedMesh.parent.Dude.decreaseHealth(pickInfo.pickedPoint);
                }


            }
        }

    }

    return tank;
}

function createHeroDude(scene)
{
    console.log("OndudeImported deleted. (one of them)");
    //BABYLON.SceneLoader.ImportMesh("him", "models/Dude/", "Dude.babylon", scene, onDudeImported); // I'm not supposed to need this line but I do need it... end of vid31
    var meshTask = scene.assetsManager.addMeshTask("DudeTask", "him", "models/Dude/", "dude.babylon");

    meshTask.onSuccess = function (task) {

        onDudeImported(task.loadedMeshes, task.loadedParticleSystems, task.loadedSkeletons);
        function onDudeImported(newMeshes, particleSystems, skeletons) {
            newMeshes[0].position = new BABYLON.Vector3(0,0,5); // the original dude
            newMeshes[0].name = "heroDude";
            var heroDude = newMeshes[0];
            for (var i = 1; i < heroDude.getChildren().length; i++)
            {
                //console.log(heroDude.getChildren()[i].name);
                heroDude.getChildren()[i].name = "clone_".concat(heroDude.getChildren()[i].name);
            }

            heroDude.animatableObject = scene.beginAnimation(skeletons[0],0,120,true,1.0);
            var hero = new Dude(heroDude, 2, -1, scene,.2);
            scene.followCameraDude = createFollowCamera(scene, heroDude);

            scene.dudes = [];
            scene.dudes[0] = heroDude;
            for ( var q = 1; q <= 10; q++) {
                scene.dudes[q] = DoClone(heroDude, skeletons, q);
                scene.beginAnimation(scene.dudes[q].skeleton, 0, 120, true, 1.0);
                var temp = new Dude(scene.dudes[q], 2, q, scene, .2);
            }
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

        heroRabbit.animatableObject = scene.beginAnimation(skeletons[0],0,70,true,2.0);

        var rabbit = new Rabbit(heroRabbit, 2, -1, scene, .1);
        scene.followCameraRabbit = createFollowCamera(scene, heroRabbit);

        scene.rabbits = [];
        scene.rabbits[0] = heroRabbit;
        for (var q = 1; q <= 5; q++) {
            scene.rabbits[q] = DoClone(heroRabbit, skeletons, q);
            scene.beginAnimation(scene.rabbits[q].skeleton, 0, 70, true, 2.0);
            var temp = new Rabbit(scene.rabbits[q], 2, q, scene, .1);
        }

        //heroRabbit.scaling = new BABYLON.Vector3(.5, .5, .5);

    });

}

function createHeroCar(scene)
{
    BABYLON.SceneLoader.ImportMesh("", "models/Low-Poly-Racing-Car/", "Low-Poly-Racing-Car.babylon", scene, function (meshes, particleSystems, skeletons) {
        meshes[0].position = new BABYLON.Vector3(0,4,50);
        meshes[0].name = "heroCar";
        var heroCar = meshes[0];
        heroCar.scaling = new BABYLON.Vector3(.08, .08, .08);
        //scene.beginAnimation(skeletons[0],0,70,true,2.0);

        var car = new Car(heroCar, 2, -1, scene, .08);
        scene.followCameraCar = createFollowCamera(scene, heroCar);

        scene.cars = [];
        scene.cars[0] = heroCar;
        for (var q = 1; q <= 5; q++) {
            scene.cars[q] = DoClone(heroCar, skeletons, q, 4);
            var temp = new Car(scene.cars[q], 2, q, scene, .08);
        }

    });

}




function DoClone(original, skeletons, id, pos=0) {

    var myClone;

    var xrand = Math.floor(Math.random() * 501) - 250;
    var zrand = Math.floor(Math.random() * 501) - 250;

    myClone = original.clone("clone_"+ id);
    myClone.position = new BABYLON.Vector3(xrand,pos,zrand);

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

function moveHeroDude() {
    var heroDude = scene.getMeshByName("heroDude");
    if(heroDude) {
        heroDude.Dude.moveFPS();
    }
}

function moveHeroRabbit(){
    var heroRabbit = scene.getMeshByName("heroRabbit");
    if(heroRabbit) {
        heroRabbit.Rabbit.moveFPS();
    }
}

function moveHeroCar(){
    var heroCar = scene.getMeshByName("heroCar");
    if(heroCar) {
        heroCar.Car.moveFPS();
    }
}


function moveOtherDudes()
{
    if(scene.dudes) {
        for(var q = 1; q< scene.dudes.length; q++) {
            scene.dudes[q].Dude.followTank();
        }
    }
}

function moveOtherRabbits()
{
    if(scene.rabbits) {
        for(var q = 1; q< scene.rabbits.length; q++) {
            scene.rabbits[q].Rabbit.followTank();
        }
    }
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

function toggleCamera(currentCam){
    if(currentCam == "heroDudeFollowCamera") {
        scene.activeCamera = scene.followCameraTank;
    } else if ( currentCam == "heroTankFollowCamera") {
        scene.activeCamera = scene.followCameraRabbit;
    } else if ( currentCam == "heroRabbitFollowCamera") {
        scene.activeCamera = scene.followCameraCar;
    } else if ( currentCam == "heroCarFollowCamera") {
        scene.activeCamera = scene.followCameraDude;
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
    if(event.key == 'b' || event.key == 'B')
    {
        isBPressed = true;
        console.log("fired Cannon!");
    }
    if(event.key == 'r' || event.key == 'R')
    {
        isRPressed = true;
        console.log("fired Laser hellooooo!");
    }
    if(event.key == 't' || event.key == 'T')
    {
        scene.activeCamera = scene.followCameraTank;
    }
    if(event.key == 'y' || event.key == 'Y')
    {
        scene.activeCamera = scene.followCameraDude;
    }
    if(event.key == 'p' || event.key == 'P')
    {
        console.log("P or p pressed");
        toggleCamera(scene.activeCamera.name);
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
    if(event.key == 'b' || event.key == 'B')
    {
        isBPressed = false;
    }
    if(event.key == 'r' || event.key == 'R')
    {
        isRPressed = false;
        console.log("fired Laser!");
    }
})