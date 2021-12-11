let canvas, renderer;
const scenes = [];
let model = undefined;

let timer= 0; 
let start_time = Date.now();

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';
import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';


let joints_index = {
    0 : 'pelvis',
    1 : 'left_hip',
    2 : 'right_hip',
    3 : 'spine1',
    4 : 'left_knee',
    5 : 'right_knee',
    6 : 'spine2',
    7 : 'left_ankle',
    8 : 'right_ankle',
    9 : 'spine3',
    10: 'left_foot',
    11: 'right_foot',
    12: 'neck',
    13: 'left_collar',
    14: 'right_collar',
    15: 'left_eye_smplhf',
    16: 'left_shoulder',
    17: 'right_shoulder',
    18: 'left_elbow',
    19: 'right_elbow',
    20: 'left_wrist',
    21: 'right_wrist',
    22: 'right_eye_smplhf',
    23: 'head'
}

function swap(json){
	var ret = {};
	for(var key in json){
	  ret[json[key]] = undefined;
	}
	return ret;
}

// let joints = swap(joints_index)

function loadAction(filePath,scene){
    let loader2 = new THREE.FileLoader();
	loader2.load( "/media/" + filePath, function( data ) {
        console.log(filePath)
		let actions = JSON.parse(data);
        actions = actions.rotation
        scene.userData.actions = actions;
        // console.log(scene.userData.actions)
    })
}

function loadModel(filePath,scene){

	const loader = new FBXLoader();
	loader.load( filePath, function ( object ) {

		object.traverse( function ( child ) {
			if ( child.isMesh ) {
				
				child.castShadow = true;
				child.receiveShadow = true;

			}

        } );

        console.log(scene)
        model = object;
        object.scale.set(0.15, 0.15, 0.15)
        object.position.set(0,5,0)
        scene.add(object)

        scene.userData.joints = swap(joints_index)

        for (let [key, value] of Object.entries(scene.userData.joints)) {
            scene.userData.joints[key] = object.getObjectByName(key)
        }
    

    } );
    

}


init();
animate();


function init() {

    canvas = document.getElementById( "c" );
    // model
   
    
    const geometries = [
        new THREE.BoxGeometry( 1, 1, 1 ),
        new THREE.SphereGeometry( 0.5, 12, 8 ),
        new THREE.DodecahedronGeometry( 0.5 ),
        new THREE.CylinderGeometry( 0.5, 0.5, 1, 12 )
    ];

    const content = document.getElementById( 'content' );

    let modelName = ["truth", "mugl", "action2motion", "sagcn"]
    let actionPaths = ["../actions/sample0.json", "../actions/quat_data2.json"]

    for ( let i = 0; i < 4; i ++ ) {

        const scene = new THREE.Scene();

        // make a list item
        const element = document.createElement( 'div' );
        element.className = 'list-item';

        const sceneElement = document.createElement( 'div' );
        element.appendChild( sceneElement );

        const descriptionElement = document.createElement( 'div' );
        descriptionElement.innerText = 'Scene ' + ( i + 1 );
        element.appendChild( descriptionElement );

        // the element that represents the area we want to render the scene
        scene.userData.element = sceneElement;
        content.appendChild( element );

        const camera =  new THREE.PerspectiveCamera(50,1,1,800);
        camera.position.z = 35;
        camera.position.y = 5;
        camera.position.x = 5;

        scene.userData.model = modelName[i]

        scene.userData.camera = camera;

        const controls = new OrbitControls( scene.userData.camera, scene.userData.element );
        // controls.minDistance = 2;
        // controls.maxDistance = 5;
        scene.userData.controls = controls;

        
	    loadModel('/media/temp/TEST2.fbx',scene)
        
        scene.add( new THREE.HemisphereLight( 0xaaaaaa, 0x444444 ) );
        
        // if(i <= 1)loadAction(actionPaths[i], scene)
        
        const light = new THREE.DirectionalLight( 0xffffff, 0.5 );
        light.position.set( 1, 1, 1 );
        scene.add( light );

        scenes.push( scene );
    }

    


    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
    renderer.setClearColor( 0xffffff, 1 );
    renderer.setPixelRatio( window.devicePixelRatio );

}

function updateSize() {

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if ( canvas.width !== width || canvas.height !== height ) {

        renderer.setSize( width, height, false );

    }

}

function animate() {

    render();
    requestAnimationFrame( animate );

}

function render() {

    updateSize();

    canvas.style.transform = `translateY(${window.scrollY}px)`;

    renderer.setClearColor( 0xffffff );
    renderer.setScissorTest( false );
    renderer.clear();

    renderer.setClearColor( 0xe0e0e0 );
    renderer.setScissorTest( true );

    if(Date.now() - start_time > 100){
		timer = (timer + 1)%10;
		start_time = Date.now();
    }
    

    scenes.forEach( function ( scene ) {
        // console.log(scene.userData.modelName)

        // so something moves
        if(scene.userData.model == "truth" || scene.userData.model == "mugl"){
        
            if(scene.userData.actions ){
                for (let joint=0;joint<23;joint++){
                    let bone = joints_index[joint] 
                    if(scene.userData.joints == undefined)return;

                    if(joint == 0){
                        continue
                    }
                    else{
        
                        scene.userData.joints[bone].setRotationFromQuaternion( new THREE.Quaternion(
                            scene.userData.actions[timer][joint][0], 
                            scene.userData.actions[timer][joint][1],
                            scene.userData.actions[timer][joint][2],
                            scene.userData.actions[timer][joint][3] 
                        ))
        
                    }
                }	
            }
        }
        


        // get the element that is a place holder for where we want to
        // draw the scene
        const element = scene.userData.element;

        // // get its position relative to the page's viewport
        const rect = element.getBoundingClientRect();

        // // check if it's offscreen. If so skip it
        if ( rect.bottom < 0 || rect.top > renderer.domElement.clientHeight ||
             rect.right < 0 || rect.left > renderer.domElement.clientWidth ) {

            return; // it's off screen

        }

        // // set the viewport
        const width = rect.right - rect.left;
        const height = rect.bottom - rect.top;
        const left = rect.left;
        const bottom = renderer.domElement.clientHeight - rect.bottom;

        renderer.setViewport( left, bottom, width, height );
        renderer.setScissor( left, bottom, width, height );

        const camera = scene.userData.camera;

        renderer.render( scene, camera );

    } );

}

function off(){
    // alert("OFF got called")
	document.getElementById("overlay").style.display = "none";
	render_video();
}

function on(){
    // alert("ON go called")
	document.getElementById("overlay").style.display = "block";
	var timeleft = 3;
	
	var timer = setInterval(function(){

	  	document.getElementById("countdown").innerHTML = timeleft;
	  	timeleft -= 1;
	  	if(timeleft<=0){
			clearInterval(timer);
	    	document.getElementById("countdown").innerHTML = "";
			
			off();
	  	}
	}, 1000);
}

function SubmitGuess(){
	
	// isSubmit = true;
	// guess = $("input[name='guess']:checked").val();
	// console.log("GUESS IS ", guess)

	$.ajax({
		url: 'submit1',
		type: 'POST',
		data: {
			'rank': "MUGL,GROUND_TRUTH,SAGCN,Action2Motion"
		},
		success: function(response){
            // alert("SUCcess")
			let timeleft = 2;

			var wait = setInterval(function(){
				timeleft -= 1;
				if(timeleft<=0){
					clearInterval(wait);
					on();
				}  
			  }, 1000);

			},
			
		error: function(response){
			// alert(response)
			console.log(response)
		}
	})
}


function render_video(){

	$.ajax({
		url : 'nextvideo3',
		type:'POST',
		success: function(response){

			let action = response.action
			let mugl_path = response.mugl_path
			let truth_path = response.truth_path
            let paths = []

            document.getElementById("action").innerHTML = "Action Name: " + action
            
            paths.push(response.truth_path)
            paths.push(response.mugl_path)

            console.log(mugl_path,truth_path)
            let count = 0
            scenes.forEach( function ( scene ) {
                loadAction(paths[count],scene)
                count+=1
            })
		},
		error: function(response){
            console.log(response)
			window.location = response.responseText
            
		}
	})

	$('#formResponse').submit(function(e) {
		$("#btnSubmit").attr("disabled", true);
		e.stopImmediatePropagation();
		e.preventDefault();
		SubmitGuess();
	});

}



window.onload = render_video
