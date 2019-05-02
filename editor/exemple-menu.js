menubar.add(
    new UI.Menu('Plugins').addItems(
        new UI.MenuItem( 'Add', e=> console.log('add from debugger?') )
    )
)

Menubar.Add = editor=> {
	var container, title, options
	
	var meshCount = 0
	var lightCount = 0
	var cameraCount = 0

	editor.signals.editorCleared.add( function () {

		meshCount = 0
		lightCount = 0
		cameraCount = 0

	} )
	
	container=		new UI.Panel()
						.setClass( 'menu' )
						.add(
	title=					new UI.Panel().setClass( 'title' ).setTextContent( 'Add' ),
	options=				new UI.Panel().setClass( 'options' ).add(

								// Group

								 new UI.MenuItem( 'Group', e=> {

										var mesh = new THREE.Group()
										mesh.name = 'Group ' + ( ++ meshCount )

										editor.execute( new AddObjectCommand( mesh ) )

									} ),

								//

								new UI.HorizontalRule(),

								// Plane

								new UI.MenuItem( 'Plane', e=> {

										var geometry = new THREE.PlaneBufferGeometry( 2, 2 )
										var material = new THREE.MeshStandardMaterial()
										var mesh = new THREE.Mesh( geometry, material )
										mesh.name = 'Plane ' + ( ++ meshCount )

										editor.execute( new AddObjectCommand( mesh ) )

									} ),

								// Box

								new UI.MenuItem( 'Box', e=> {

										var geometry = new THREE.BoxBufferGeometry( 1, 1, 1 )
										var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() )
										mesh.name = 'Box ' + ( ++ meshCount )

										editor.execute( new AddObjectCommand( mesh ) )

									} ),

								// Circle

								new UI.MenuItem( 'Circle', e=> {
/*( radius, segments )=> 
		new THREE.Mesh(
			new THREE.CircleBufferGeometry( radius, segments ),
			new THREE.MeshStandardMaterial()
		)
*/
										var radius = 1
										var segments = 32

										var geometry = new THREE.CircleBufferGeometry( radius, segments )
										var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() )
										mesh.name = 'Circle ' + ( ++ meshCount )

										editor.execute( new AddObjectCommand( mesh ) )

									} ),

								//

								new UI.HorizontalRule(),

								// PerspectiveCamera

								new UI.MenuItem( 'PerspectiveCamera', e=> {

										var camera = new THREE.PerspectiveCamera( 50, 1, 1, 10000 )
										camera.name = 'PerspectiveCamera ' + ( ++ cameraCount )

										editor.execute( new AddObjectCommand( camera ) )

									} )
								)
							)
	)



	return container

}
