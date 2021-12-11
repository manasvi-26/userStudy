let camera, scene, renderer;

let mixer;
let actions,action_joints;
let counter= 0; 
let start_time = Date.now();
let pause = false;
let pause_cnt = 0;
let replays = 0;
var clock = new THREE.Clock();
let clock_start_time;
let isSubmit = false;
let model;

const sleep = time => {
	return new Promise((resolve) => setTimeout(resolve, time));
};

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

let joints = swap(joints_index)
let Tpose = []



init();


function loadModel(filePath){
	const loader = new THREE.FBXLoader();
	loader.load( filePath, function ( object ) {


		object.traverse( function ( child ) {
			if ( child.isMesh ) {
				
				child.castShadow = true;
				child.receiveShadow = true;

			}

		} );
		
		scene.add( object );

		for (let [key, value] of Object.entries(joints)) {
			joints[key] = object.getObjectByName(key)
			Tpose.push(object.getObjectByName(key).quaternion)
		}

		console.log(Tpose)
					
		object.position.y += 130
		model = object
		const axesHelper = new THREE.AxesHelper( 10 );
		scene.add( axesHelper );

	} );

}

function reset(){

	isSubmit = false
	counter = 0 //reset animation counter
	clock_start_time = Date.now() // reset timer
	pause = false // play animation

	document.getElementById("submit_button").disabled = true;
	document.getElementById("replay").disabled = true;


	let o5 = $("#o5")
	console.log(o5)
	console.log($("#o5").prop('checked', true)) // check none of these option


}

function loadAction(filePath){
	
	let loader2 = new THREE.FileLoader();
	loader2.load( "/media/" + filePath, function( data ) {
		actions = JSON.parse(data);
		actions = actions.rotation
	})
	reset();
	animate();

}

function init() {
	// alert("Init was called")
	const container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
	camera.position.set( 20, 50, 400 );
    camera.lookAt(0,0,0)


	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xa0a0a0 );
	scene.fog = new THREE.Fog( 0xa0a0a0, 200, 1000 );

	const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
	hemiLight.position.set( 0, 200, 0 );
	scene.add( hemiLight );

	const dirLight = new THREE.DirectionalLight( 0xffffff );
	dirLight.position.set( 0, 200, 100 );
	dirLight.castShadow = true;
	dirLight.shadow.camera.top = 180;
	dirLight.shadow.camera.bottom = - 100;
	dirLight.shadow.camera.left = - 120;
	dirLight.shadow.camera.right = 120;
	scene.add( dirLight );


	scene.background = new THREE.Color( 0xeeeeee );
	scene.add( new THREE.GridHelper( 400, 10 ) );


	// model
	loadModel('/media/temp/TEST2.fbx')


	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMap.enabled = true;
	container.appendChild( renderer.domElement );

	const controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.target.set( 0, 100, 0 );
	controls.update();
	window.addEventListener( 'resize', onWindowResize );


}


function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}


function toggle_pause(){
	
	if(counter + 1 == actions.length)counter = 0;
	pause = !pause
	pause_cnt += 1
}

function left(){
	model.rotation.set(0,-1.5,0)
}

function right(){
	model.rotation.set(0,1.5,0)
}

function front(){
	model.rotation.set(0,0,0)
}

function replay(){
	pause = false
	replays += 1
	counter = 0
}

function timer(){
	return (30 - Math.min(30, parseInt((Date.now() - clock_start_time )/1000)))
}

function animate() {
	// console.log(camera.position)
	requestAnimationFrame( animate );
	
	if(!isSubmit) document.getElementById("time").innerHTML = "Time left: " + timer() + " seconds"
	

	if(Date.now() - start_time > 150 && !pause){
		
		if(counter + 1 == actions.length){
			pause = true;
			document.getElementById("submit_button").disabled = false;
			document.getElementById("replay").disabled = false;

		}

		else{
			counter = (counter + 1)%actions.length;
			start_time = Date.now();
			for (let joint=0;joint<23;joint++){
				
				let bone = joints_index[joint] 
					if(joint == 0){
						continue
					}
					else{
						joints[bone].setRotationFromQuaternion( new THREE.Quaternion(
							actions[counter][joint][0], 
							actions[counter][joint][1],
							actions[counter][joint][2],
							actions[counter][joint][3] 
						))
					}
			}	
		}
	}

	renderer.render( scene, camera );

}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};


function off(){
	document.getElementById("overlay").style.display = "none";
	render_video();
}

function on(){
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
	console.log("Im called twice? : render submit")
	
	isSubmit = true;
	guess = $("input[name='guess']:checked").val();
	console.log("GUESS IS ", guess)

	$.ajax({
		url: 'submit1',
		type: 'POST',
		data: {
			'guess': guess,
			'num_pause': pause_cnt,
			'num_replay': replays,
		},
		success: function(response){
			console.log(response)
			if (response.status)
				$('.' + guess.replaceAll('_','')).css('color','green');
			else
			{
				console.log("red color is ",guess )
				$('.' + guess.replaceAll('_','')).css('color','red');
				$('.' + response.correctAnswer.replaceAll('_','')).css('color','green');
			}

			let timeleft = 2;

			var wait = setInterval(function(){
				timeleft -= 1;
				if(timeleft<=0){
					clearInterval(wait);
					console.log("calling on ..")
					$('.' + guess.replaceAll('_','')).css('color','grey');
					$('.' + guess.replaceAll('_','')).prop('checked', false);
					$('.' + response.correctAnswer.replaceAll('_','')).css('color','grey');

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
		url : 'nextvideo',
		type:'POST',
		success: function(response){

			console.log(response)

			let action = response.action
			let path = response.path
			action = action.replaceAll('_', ' ')
			console.log(action)
			$('#o1').html(action);
			$('#option1').val(response.action);
			$('#o1').addClass(response.action.replaceAll('_',''));

			$('#o2').html('wrong option 2');
			$('#option2').val('wrongoption2');
			$('#o2').addClass('wrongoption2');

			$('#o3').html('wrong option 3');
			$('#option3').val('wrongoption3');
			$('#o3').addClass('wrongoption3');

			$('#o4').html('wrong option 4');
			$('#option4').val('wrongoption4');
			$('#o4').addClass('wrongoption4');
			
			$('#option5').val('wrongoption5');
			$('#o5').addClass('wrongoption5');


			loadAction(path)
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
