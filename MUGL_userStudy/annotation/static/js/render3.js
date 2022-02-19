let canvas, renderer;
const scenes = [];
let models = []

let timer= 0; 
let start_time = Date.now();
let isSubmit = false;

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';
import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';

let clock_start_time;

let model_index_dict = {
    'Scene 1' : "MUGL++",
    'Scene 2' : "GROUND_TRUTH",
    'Scene 3' : "MUGL",
    'Scene 4' : "ACTOR",
}

let joints_index_withoutFinger= {

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

let joints_index = {
	0:'pelvis',
    1:'left_hip',
    2:'right_hip',
    3:'spine1',
    4:'left_knee',
    5:'right_knee',
	6:'spine2',
    7:'left_ankle',
    8:'right_ankle',
    9:'spine3',
    10:'left_foot',
    11:'right_foot',
    12:'neck',
    13:'left_collar',
    14:'right_collar',
    15:'head',
    16:'left_shoulder',
    17:'right_shoulder',
    18:'left_elbow',
    19:'right_elbow',
    20:'left_wrist',
    21:'right_wrist',
    22:'left_index1',
    23:'left_index2',
    24:'left_index3',
    25:'left_middle1',
    26:'left_middle2',
    27:'left_middle3',
    28:'left_pinky1',
    29:'left_pinky2',
    30:'left_pinky3',
    31:'left_ring1',
    32:'left_ring2',
    33:'left_ring3',
    34:'left_thumb1',
    35:'left_thumb2',
    36:'left_thumb3',
    37:'right_index1',
    38:'right_index2',
    39:'right_index3',
    40:'right_middle1',
    41:'right_middle2',
    42:'right_middle3',
    43:'right_pinky1',
    44:'right_pinky2',
    45:'right_pinky3',
    46:'right_ring1',
    47:'right_ring2',
    48:'right_ring3',
    49:'right_thumb1',
    50:'right_thumb2',
    51:'right_thumb3',
	
}

function swap(json){
	var ret = {};
	for(var key in json){
	  ret[json[key]] = "bone";
	}
	return ret;
}

// let joints = swap(joints_index)

function traverse(bone,joints, jointswithoutFinger){


	for(let i=0;i<bone.children.length;i++){
		let child = bone.children[i]
        console.log(child.name)
        
        if(joints[child.name] == undefined && jointswithoutFinger[child.name] == undefined){
			bone.remove(child)
		}
		traverse(child,joints, jointswithoutFinger)
	}
}

function loadAction(filePath,scene){
    let loader2 = new THREE.FileLoader();
	loader2.load( "/media/" + filePath, function( data ) {
		let actions = JSON.parse(data);
        actions = actions.rotation
        scene.userData.actions = actions;
    })
}
function reset(){

	isSubmit = false
	clock_start_time = Date.now() // reset timer
}

function loadModel(filePath,scene,modelName){

	const loader = new FBXLoader();
	loader.load( filePath, function ( object ) {

		object.traverse( function ( child ) {
			if ( child.isMesh ) {
				
				child.castShadow = true;
				child.receiveShadow = true;

			}

        } );

        object.scale.set(15, 15, 15)
        object.position.set(0,5,0)


        
        if(modelName == "mugl++" || modelName == "truth") scene.userData.joints = swap(joints_index)
        else scene.userData.joints = swap(joints_index_withoutFinger)

		traverse(object.children[0], swap(joints_index), swap(joints_index_withoutFinger))
        scene.add(object)


        for (let [key, value] of Object.entries(scene.userData.joints)) {
            scene.userData.joints[key] = object.getObjectByName(key)
        }
        
        const helper = new THREE.SkeletonHelper( object );
        scene.add( helper );
        
        const axesHelper = new THREE.AxesHelper( 10 );
		// scene.add( axesHelper );
		
		let skeletonHelper = new THREE.SkeletonHelper(object);
		scene.add(skeletonHelper)


		models.push(skeletonHelper);


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

    let modelName = ["truth", "mugl++", "mugl", "actor"]
    // let actionPaths = ["../actions/sample0.json", "../actions/quat_data2.json"]

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
        
        scene.timer = 0;
        scene.start_time = Date.now()

        
	    loadModel('/media/temp/skeleton2.fbx',scene, modelName[i])
        
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

function get_time(){
	return (20000 - Math.min(20000, parseInt((Date.now() - clock_start_time )/1000)))
}

function animate() {

    if(!isSubmit && get_time() <= 0){
		isSubmit = true;
		SubmitGuess();
    }
    
    if(!isSubmit) document.getElementById("time").innerHTML = "Time left :" + get_time() +"s"
    
    

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
        if(scene.userData.actions == undefined)return;

        // so something moves

        

        if(Date.now() - scene.start_time > 100){
            scene.timer = (scene.timer + 1)%scene.userData.actions.length;
            scene.start_time = Date.now();
           
        }

        if(scene.userData.model == "truth" || scene.userData.model == "mugl++"){
            
            if(scene.userData.actions ){
                for (let joint=0;joint<52;joint++){
                    let bone = joints_index[joint] 
                    if(scene.userData.joints == undefined)return;

                    if(joint == 0){
                        continue
                    }
                    else{
        
                        scene.userData.joints[bone].setRotationFromQuaternion( new THREE.Quaternion(
                            scene.userData.actions[scene.timer][0][joint][0], 
                            scene.userData.actions[scene.timer][0][joint][1],
                            scene.userData.actions[scene.timer][0][joint][2],
                            scene.userData.actions[scene.timer][0][joint][3] 
                        ))
        
                    }
                }	
            }
        }

        if(scene.userData.model == "mugl"){
            if(scene.userData.actions ){
               
                for (let joint=0;joint<24;joint++){
                    let bone = joints_index_withoutFinger[joint] 
                    if(scene.userData.joints == undefined)return;

                    if(joint == 0){
                        continue
                    }
                    else{
        
                        scene.userData.joints[bone].setRotationFromQuaternion( new THREE.Quaternion(
                            scene.userData.actions[scene.timer][joint][0], 
                            scene.userData.actions[scene.timer][joint][1],
                            scene.userData.actions[scene.timer][joint][2],
                            scene.userData.actions[scene.timer][joint][3] 
                        ))
        
                    }
                }
            }
        }

        if(scene.userData.model == "actor"){

            for ( let person = 0; person < 1;person++){
                if(scene.userData.joints['pelvis'] === undefined)break;

                for (let joint=0;joint<21;joint++){
        
                    let bone = joints_index_withoutFinger[joint]; 
                    scene.userData.joints[bone].rotation.x = scene.userData.actions[scene.timer][0][joint][0]; 
                    scene.userData.joints[bone].rotation.y = scene.userData.actions[scene.timer][0][joint][1]; 
                    scene.userData.joints[bone].rotation.z = scene.userData.actions[scene.timer][0][joint][2]; 
                
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
	
	isSubmit = true;
    let rank = "";
    let items = document.querySelectorAll('.container .box');

    items.forEach(function(item) {
        rank += model_index_dict[item.innerHTML] 
        rank += ","
    })

    
	$.ajax({
		url: 'submit1',
		type: 'POST',
		data: {
			'rank': rank
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


String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};


function render_video(){

	$.ajax({
		url : 'nextvideo3',
		type:'POST',
		success: function(response){
            console.log(response)

			let action = response.action
			let mugl_path = response.mugl_path
            let truth_path = response.truth_path            
            let mugl_old_path = response.mugl_old_path
            let actor_path = response.actor_path

            let question = response.question
	        document.getElementById("question").innerHTML = "Question :" + question

            let paths = []

            document.getElementById("action").innerHTML = "Action Name: " + action.replaceAll('_',' ')
            
            paths.push(response.truth_path)
            paths.push(response.mugl_path)
            paths.push(response.mugl_old_path)
            paths.push(response.actor_path)

            console.log(mugl_path,truth_path, mugl_old_path, actor_path)
            let count = 0
            scenes.forEach( function ( scene ) {
                loadAction(paths[count],scene)
                count+=1
                console.log(count)
            })
            reset();
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