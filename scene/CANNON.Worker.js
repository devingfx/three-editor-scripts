// Create worker from a blob for the inline worker code
var worker
,	DEBUG = 0 	// 0: no trace 1: infos 2:warnings 3:errors
,	timeStep = 1.0 / 60.0 // seconds

const physicsBlob = URL.createObjectURL(new Blob([`
// Load cannon.js
${CANNON_SOURCE}

var world, DEBUG = ${DEBUG}
onmessage = e=> api[e.data.action]( e.data )

strEval = s=> typeof s == 'string' && s.indexOf('new CANNON.') === 0 ? eval('('+s+')') : s

const  api = {
	init( options )
	{
		if( CANNON && !world )
		{
			// Init physics
			world = new CANNON.World()
			world.broadphase = new CANNON.NaiveBroadphase()
			world.gravity.set( ...(options.gravity || [0,-10,0]) )
			world.relativeGravity = options.relativeGravity || false
			world.solver.tolerance = options.solverTolerance || 0.001
			world.getBodyById = id=> world.bodies.filter( b=> b.uuid == id )[0]
		}
	}
,	start()
	{
		
	}

,	stop()
	{
		
	}
	
,	pause()
	{
		
	}
,	updateGravity()
	{
		for( var objA, i = 0; objA = world.bodies[i++]; )
		{
			if( objA.relativeGravity )
			{
				1<DEBUG&& console.info('[Physics]: updateGravity', 'objA = '+objA.id)
				// #Made by Philip Winter: https://www.youtube.com/user/Phil000002
				let totalForce = new CANNON.Vec3(0,0,0), 
					G = 1,//PARAMS.sim.Universe["Plank constant"],
					Fg=0, Fx=0, Fy=0, Fz=0
				
				for( var objB, j = 0; objB = world.bodies[j++]; )
				//for( var objB, i = 0; objB = scene.children[i++]; )
				{
					if( objB != objA && objB.relativeGravity )
					{
						1<DEBUG&& console.log('[Physics]: updateGravity', 'objB = '+objB.id )
						let distVec = new CANNON.Vec3(
							objB.position.x - objA.position.x,
						// d_rel = [ objB.position.x - objA.position.x,
							objB.position.y - objA.position.y,
							objB.position.z - objA.position.z )
						
						let distSquared = distVec.x**2 + distVec.y**2 + distVec.z**2
						let dist = Math.sqrt( distSquared )
						
						if( dist != 0 )
							Fg = G * objA.mass * objB.mass / distSquared
						else
							Fg = 0.0
						
						/*
						if( distVec.x != 0.0 )
							Fx = Math.abs( Fg * distVec.x / dist )
						if( distVec.y != 0.0 )
							Fy = Math.abs( Fg * distVec.y / dist )
						if( distVec.z != 0.0 )
							Fz = Math.abs( Fg * distVec.z / dist )
						
						if( distVec.x < 0 && Fx > 0 )
							Fx = -Fx
						if( distVec.y < 0 && Fy > 0 )
							Fy = -Fy
						if( distVec.z < 0 && Fz > 0 )
							Fz = -Fz
						*/
						if( distVec.x != 0.0 )
							Fx = 	Fg * distVec.x / dist 
						if( distVec.y != 0.0 )
							Fy =  Fg * distVec.y / dist 
						if( distVec.z != 0.0 )
							Fz =  Fg * distVec.z / dist 
						
						1<DEBUG&& console.log('[Physics]: updateGravity', ' totalForce = ', totalForce, ' dist = ', dist, ' distVec = ', distVec)
						totalForce.x += Fx
						totalForce.y += Fy
						totalForce.z += Fz
						
						// --------
						// let d_rel_abs = Math.sqrt(d_rel[0]**2 + d_rel[1]**2 + d_rel[2]**2)
						// mass2 = obj2.mass
						// F_total += G * mass1 * mass2 * d_rel / (d_rel_abs * d_rel_abs * d_rel_abs)
					// })
					}
				}
				1<DEBUG&& console.log('[Physics]: updateGravity', 'totalForce = '+totalForce)
				objA.applyLocalForce(totalForce, new CANNON.Vec3(0,0,0) ) 
				
			}
		}
	}
,	step( data )
	{
		1<DEBUG&& console.log('[Physics]: world.relativeGravity = '+world.relativeGravity)
		// Calculate relative gravity between bodies
		world.relativeGravity && this.updateGravity()
		
		// Step the world
		world.step( data.timeStep )
		
		// Copy over the data to the buffers
		var positions = data.positions
		var quaternions = data.quaternions
		var velocities = data.velocities
		var ids = []
		for(var i=0; i!==world.bodies.length; i++)
		{
			var b = world.bodies[i],
				p = b.position,
				q = b.quaternion,
				v = b.velocity
			ids[i] = b.id
			positions[3*i + 0] = p.x;
			positions[3*i + 1] = p.y;
			positions[3*i + 2] = p.z;
			quaternions[4*i + 0] = q.x;
			quaternions[4*i + 1] = q.y;
			quaternions[4*i + 2] = q.z;
			quaternions[4*i + 3] = q.w;
			velocities[3*i + 0] = v.x;
			velocities[3*i + 1] = v.y;
			velocities[3*i + 2] = v.z;
		}
		// Send data back to the main thread
		self.postMessage({
			ids: ids,
			positions: positions,
			quaternions: quaternions,
			velocities: velocities
		}, [positions.buffer, quaternions.buffer, velocities.buffer]);
	}
,	eval( data )
	{
		eval( data.code )
		1<DEBUG&& console.log('[Physics]: worker eval\\n', data.code )
	}
}
`], {type: 'text/javascript'}))

var physicalObjects = {}
// Data arrays. Contains all our kinematic data we need for rendering.
var positions = new Float32Array()
var quaternions = new Float32Array()
var velocities = new Float32Array()

function init()
{
	
	worker = new Worker( physicsBlob )
	worker.postMessage = worker.webkitPostMessage || worker.postMessage;
	stringify = o=> o instanceof THREE.Vector3 ?
						`new CANNON.Vec3(${o.x},${o.y},${o.z})`
					: o instanceof THREE.Quaternion ?
						`new CANNON.Quaternion(${o.x},${o.y},${o.z},${o.w})`
					: JSON.stringify(o)
	worker.eval = (ss,...pp) => worker.postMessage({
		action: 'eval',
		code: Array.from(ss).map( (s,i)=> s+(stringify(pp[i])||'') ).join('')
	})

	var sendTime, N=10; // Time when we sent last message
	worker.onmessage = function(e)
	{
		1<DEBUG&& console.log(e)
		// Get fresh data from the worker
		positions = e.data.positions;
		quaternions = e.data.quaternions;
		velocities = e.data.velocities;
		let ids = e.data.ids
		1<DEBUG&& console.log('[Physics]: ids.length = ', ids.length)
		// Update rendering meshes
		for(var i=0; i!==ids.length; i++)
		{
			let obj = scene.getObjectById( ids[i] )
			1<DEBUG&& console.log( ids[i], obj )
			obj.position.set(	positions[3*i+0],
								positions[3*i+1],
								positions[3*i+2] );
			obj.quaternion.set(	quaternions[4*i+0],
								quaternions[4*i+1],
								quaternions[4*i+2],
								quaternions[4*i+3] );
		}
		// If the worker was faster than the time step (dt seconds), we want to delay the next timestep
		var delay = timeStep * 1000 - (Date.now()-sendTime);
		if(delay < 0){
			delay = 0;
		}
		setTimeout(sendDataToWorker,delay);
	}

	
	const { gravity = [0,-9.87,0], relativeGravity, solverTolerance } = scene.userData.physics
	worker.postMessage({ action: 'init',
		gravity,
		relativeGravity, 
		solverTolerance
	})
}
function sendDataToWorker()
{
	sendTime = Date.now();
	worker.postMessage({ action: 'step',
		timeStep,
		positions,
		quaternions,
		velocities
	},[positions.buffer, quaternions.buffer, velocities.buffer])
}
function start (event)
{
	scene.updateMatrixWorld()
	this.traverse( obj=>
	{
		//debugger;
		var visible = true
		obj.traverseAncestors( obj=> visible = visible && obj.visible )
		
		if( visible && obj instanceof THREE.Object3D && !(obj instanceof THREE.Scene) && obj.userData.physics )
		{
			var args = [], constraint
			physicalObjects[obj.id] = obj
			
			obj.geometry.computeBoundingSphere()
			obj.geometry.computeBoundingBox()
			var ws = obj.getWorldScale()
			let { shape } = obj.userData.physics
			
			worker.eval`
			let shape = new CANNON[${shape}](${
				shape == 'Box' ?
					obj.geometry.boundingBox.max.clone().multiply(ws)
				: shape == 'Sphere' ?
					obj.geometry.boundingSphere.radius
					* Math.max(ws.x,ws.y,ws.z)
				: ''
			})
			let body = new CANNON.Body( Object.assign({}, ${obj.userData.physics}, {shape}) )
			body.id = ${obj.id}
			body.position.copy(${obj.getWorldPosition()})
			body.quaternion.copy(${obj.quaternion})
			body.relativeGravity = ${obj.userData.physics.relativeGravity}
			body.linearDamping = 0.9999
			body.angularDamping = 0.9999
			world.add( body )
			`
			
			// Cook constraints
			
			/*
			if( scene.userData.physics.helpers )
			{
				obj.velocityHelper = new THREE.ArrowHelper( obj.physics.velocity, obj.position, 100, 0x0000BB,2,2 )
				scene.add( obj.velocityHelper )
			}*/
			//scene.world.add( obj.physics )
		}
	})
	
	var N = Object.keys( physicalObjects ).length
	1<DEBUG&& console.log('[Physics]: N = ', N)
	// Data arrays. Contains all our kinematic data we need for rendering.
	positions = new Float32Array(N*3)
	quaternions = new Float32Array(N*4)
	velocities = new Float32Array(N*3)
	
	sendDataToWorker()
}

function update( event )
{
	//this.world.step( timeStep )
	/*worker.postMessage({
		action: 'step',
		timeStep: timeStep,
		positions, quaternions
	}, [positions.buffer, quaternions.buffer])
	/*
	this.traverse( obj=>
	{
		 if( obj.physics )
		 {
			 //scene.updateMatrixWorld()
			 //console.log('%s : %o\nobj : %o\n%o\n%o', obj.parent.type,obj.parent.position, obj.physics.position, new THREE.Vector3().copy(obj.physics.position), obj.parent.worldToLocal(new THREE.Vector3().copy(obj.physics.position)) )
			 obj.position.copy( obj.parent.worldToLocal(new THREE.Vector3().copy(obj.physics.position)) )
			 //obj.position.copy( obj.physics.position )
			 obj.quaternion.copy(obj.physics.quaternion)
			 
			if( scene.userData.physics.helpers )
			{
				obj.velocityHelper.position.copy( obj.position )
				obj.velocityHelper.setDirection( new THREE.Vector3().copy(obj.physics.velocity) )
				obj.velocityHelper.setLength( obj.physics.velocity.length() )
			}
		 }
	})
	*/
}
function stop()
{
	worker.terminate()
}



class GravityField extends THREE.Group {
	
	constructor( objects )
	{
		let objA = newObjects[0]
		//let objB = newObjects[2]
		//newObjects.map( objA=> {
		
		newObjects.map( objB=> {
			let line = new THREE.Line(
				new THREE.Geometry(),
				new THREE.LineDashedMaterial({
					color: 0xbb00ff,
					dashSize: 5,
					gapSize: 0,
					lineWidth: 2 ,
					transparent: true,
					opacity: 0.6
				})
			)
			line.geometry.vertices = [ objA.position, objB.position ]
			line._objBMass = objB.userData.physics.mass
			Object.defineProperty( line.geometry, 'verticesNeedUpdate', { get:()=>true, set:v=>void 0 })
			//Object.defineProperty( line.geometry, 'lineDistancesNeedUpdate', { get:()=>true, set:v=>void 0 })
			line.geometry.computeLineDistances()
			//line.geometry.verticesNeedUpdate = true
			this.add( line )
		})
	
		const viewFieldOf = obj=> {
			//debugger;
			this.children
				.filter( obj=> obj instanceof THREE.Line )
				.map( line=> {
					line.geometry.vertices[0] = obj.position
					line._objAMass = obj.userData.physics.mass
				})
		
		}
		
		var i = 0
		intvlID = setInterval( ()=> viewFieldOf(newObjects[i]) || i++
		,3000)
				
	}

	update() {
		this.children.filter( obj=> obj instanceof THREE.Line )
			.map( line=> {
					line.geometry.computeLineDistances()
					//console.log(line.geometry.lineDistances[1])
					let Fg = line._objAMass * line._objBMass / line.geometry.lineDistances[1]**2
					line.material.opacity = Fg/1000
					line.material.lineWidth = Fg/1000
					
				})
	}
}


/*

		// Velocity arrow helper
		this._velocityArrow = new THREE.ArrowHelper(
			// this.body.velocity,
			new THREE.Vector3(0, 0, 0),
			new THREE.Vector3(0, 0, 0),
			1,
			0x0000FF
		);
*/