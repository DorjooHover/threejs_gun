var scene, camera, renderer, mesh, clock;
var meshFloor, ambientLight, light;

var crate, crateTexture, crateNormalMap, crateBumpMap;

var keyboard = {};
var player = { height:1.8, speed:0.2, turnSpeed:Math.PI*0.02, shoot: 0 };
var USE_WIREFRAME = false;

var loadingScreen = {
	scene: new THREE.Scene(),
	camera: new THREE.PerspectiveCamera(90, 1280/720, 0.1, 100),
	box: new THREE.Mesh(
		new THREE.BoxGeometry(0.5,0.5,0.5),
		new THREE.MeshBasicMaterial({color: 0xffffff})
		)
	}

var LOADING_MANAGER = null
var RESOURCES_LOADED = false

models = {
	tent: {
		obj: "models/Tent_Poles_01.obj",
		mtl: "models/Tent_Poles_01.mtl",
		mesh:null
	},
	campfire: {
		obj: "models/Campfire_01.obj",
		mtl: "models/Campfire_01.mtl",
		mesh:null
	},
	pirateship: {
		obj: "models/Pirateship.obj",
		mtl: "models/Pirateship.mtl",
		mesh:null
	},
	gun: {
		obj: "models/uziGold.obj",
		mtl: "models/uziGold.mtl",
		mesh: null, 
		caseShadow: null,
		receiveShadow: null
	}
}

var meshes = {}

var bullets = []
function init(){
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(90, 1280/720, 0.1, 1000);
	clock = new THREE.Clock()

	loadingScreen.box.position.set(0,0,5)
	loadingScreen.camera.lookAt(loadingScreen.box.position)
	loadingScreen.scene.add(loadingScreen.box)

	loadingManager = new THREE.LoadingManager()

	loadingManager.onProgress = function(item, loaded, total) {
		console.log(item, loaded, total)
	}

	loadingManager.onLoad = function() {
		console.log('Loaded all resources')
		RESOURCES_LOADED = true
		onResourcesLoaded()
	}
	mesh = new THREE.Mesh(
		new THREE.BoxGeometry(1,1,1),
		new THREE.MeshPhongMaterial({color:0xff4444, wireframe:USE_WIREFRAME})
	);
	mesh.position.y += 1;
	mesh.receiveShadow = true;
	mesh.castShadow = true;
	scene.add(mesh);
	
	meshFloor = new THREE.Mesh(
		new THREE.PlaneGeometry(20,20, 10,10),
		new THREE.MeshPhongMaterial({color:0xffffff, wireframe:USE_WIREFRAME})
	);
	meshFloor.rotation.x -= Math.PI / 2;
	meshFloor.receiveShadow = true;
	scene.add(meshFloor);
	
	ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
	scene.add(ambientLight);
	
	light = new THREE.PointLight(0xffffff, 0.8, 18);
	light.position.set(-3,6,-3);
	light.castShadow = true;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 25;
	scene.add(light);
	
	
	var textureLoader = new THREE.TextureLoader(loadingManager);
	crateTexture = textureLoader.load("crate0/crate0_diffuse.jpg");
	crateBumpMap = textureLoader.load("crate0/crate0_bump.jpg");
	crateNormalMap = textureLoader.load("crate0/crate0_normal.jpg");
	
	crate = new THREE.Mesh(
		new THREE.BoxGeometry(3,3,3),
		new THREE.MeshPhongMaterial({
			color:0xffffff,
			map:crateTexture,
			bumpMap:crateBumpMap,
			normalMap:crateNormalMap
		})
	);
	scene.add(crate);
	crate.position.set(2.5, 3/2, 2.5);
	crate.receiveShadow = true;
	crate.castShadow = true;
	
	// Model/material loading!
	// var mtlLoader = new THREE.MTLLoader(loadingManager);
	// mtlLoader.load("./models/Tent_Poles_01.mtl", function(materials){
		
	// 	materials.preload();
	// 	var objLoader = new THREE.OBJLoader(loadingManager);
	// 	objLoader.setMaterials(materials);
		
	// 	objLoader.load("models/Tent_Poles_01.obj", function(mesh){
		
	// 		mesh.traverse(function(node){
	// 			if( node instanceof THREE.Mesh ){
	// 				node.castShadow = true;
	// 				node.receiveShadow = true;
	// 			}
	// 		});
		
	// 		scene.add(mesh);
	// 		mesh.position.set(-5, 0, 4);
	// 		mesh.rotation.y = -Math.PI/4;
	// 	});
		
	// });

	for( var _key in models ){
		(function(key){
			
			var mtlLoader = new THREE.MTLLoader(loadingManager);
			mtlLoader.load(models[key].mtl, function(materials){
				materials.preload();
				
				var objLoader = new THREE.OBJLoader(loadingManager);
				
				objLoader.setMaterials(materials);
				objLoader.load(models[key].obj, function(mesh){
					
					mesh.traverse(function(node){
						if( node instanceof THREE.Mesh ){
							if('castShadow' in models[key])
								node.caseShadow = models[key].caseShadow
							else node.castShadow = true;
							if('receiveShadow' in models[key])
								node.receiveShadow = models[key].receiveShadow
							else node.receiveShadow = true;
						}
					});
					models[key].mesh = mesh;
					
				});
			});
			
		})(_key);
	}
	
	camera.position.set(0, player.height, -5);
	camera.lookAt(new THREE.Vector3(0,player.height,0));
	
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(1280, 720);

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.BasicShadowMap;
	
	document.body.appendChild(renderer.domElement);
	
	animate();
}

function onResourcesLoaded() {

	meshes["tent1"] = models.tent.mesh.clone()
	meshes["tent2"] = models.tent.mesh.clone()
	meshes["campfire1"] = models.campfire.mesh.clone()
	meshes["campfire2"] = models.campfire.mesh.clone()
	meshes["pirateship"] = models.pirateship.mesh.clone()

	meshes["tent1"].position.set(-5,0,4)
	scene.add(meshes["tent1"])
	// meshes["tent1"].rotation.y = -Math.PI / 4
	meshes["tent2"].position.set(-8,0,4)
	scene.add(meshes["tent2"])
	meshes["campfire1"].position.set(-5,0,2.5)
	scene.add(meshes["campfire1"])

	meshes["campfire2"].position.set(-8,0,2.5)
	scene.add(meshes["campfire2"])

	meshes["pirateship"].position.set(-11,-1,1)
	meshes["pirateship"].rotation.set(0,Math.PI ,0)
	scene.add(meshes["pirateship"])

	meshes["gun"] = models.gun.mesh.clone()
	meshes["gun"].position.set(0,2,0)
	meshes["gun"].scale.set(10,10,10)
	scene.add(meshes["gun"])
}

function animate(){
	if(!RESOURCES_LOADED) {
		requestAnimationFrame(animate)

		loadingScreen.box.position.x -= 0.05
		if(loadingScreen.box.position.x < -10) loadingScreen.box.position.x = 10
		loadingScreen.box.position.y = Math.sin(loadingScreen.box.position.x)

		renderer.render(loadingScreen.scene, loadingScreen.camera)
		return
	}
	requestAnimationFrame(animate);
	
	var time = Date.now() * 0.0005
	var delta = clock.getDelta()
	mesh.rotation.x += 0.01;
	mesh.rotation.y += 0.02;
	crate.rotation.y += 0.01;
	// meshes["pirateship"].rotation.z += 0.01
	
	for( var index = 0; index<bullets.length ; index+=1){
		if(bullets[index] === undefined) continue
		if(bullets[index].alive == false) {
			bullets.splice(index, 1)
			continue
		}

		bullets[index].position.add(bullets[index].velocity)
	}


	if(keyboard[87]){ // W key
		camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
		camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
	}
	if(keyboard[83]){ // S key
		camera.position.x += Math.sin(camera.rotation.y) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
	}
	if(keyboard[65]){ // A key
		camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y + Math.PI/2) * player.speed;
	}
	if(keyboard[68]){ // D key
		camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y - Math.PI/2) * player.speed;
	}
	
	if(keyboard[37]){ // left arrow key
		camera.rotation.y -= player.turnSpeed;
	}
	if(keyboard[39]){ // right arrow key
		camera.rotation.y += player.turnSpeed;
	}

	if(keyboard[32] && player.shoot <= 0) { // space key
		var bullet = new THREE.Mesh(
			new THREE.SphereGeometry(0.05,8,8),
			new THREE.MeshBasicMaterial({color: 0xffffff})
		)

		bullet.position.set(
			meshes["gun"].position.x,
			meshes["gun"].position.y + 0.15,
			meshes["gun"].position.z
		)
		bullet.velocity = new THREE.Vector3(
			-Math.sin(camera.rotation.y), 
			0,
			Math.cos(camera.rotation.y)
		)
		bullet.alive = true
		setTimeout(
			function() {
				bullet.alive = false
				scene.remove(bullet)
			},1000)
			bullets.push(bullet)
			player.shoot = 10
			scene.add(bullet)
	}
	if(player.shoot > 0) player.shoot -= 1
	
	meshes["gun"].position.set(
		camera.position.x - Math.sin(camera.rotation.y + Math.PI / 6) * 0.75,
		camera.position.y - 0.5 + Math.sin(time*4 + camera.position.x + camera.position.y)*0.01,
		camera.position.z + Math.cos(camera.rotation.y + Math.PI / 6) * 0.75
	)

	meshes["gun"].rotation.set(
		camera.rotation.x,
		camera.rotation.y - Math.PI,
		camera.rotation.z
	)
	renderer.render(scene, camera);
}

function keyDown(event){
	keyboard[event.keyCode] = true;
}

function keyUp(event){
	keyboard[event.keyCode] = false;
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

window.onload = init;
