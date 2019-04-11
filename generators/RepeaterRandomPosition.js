function init( event ) {

	let { repeat, radius = 100 } = this.userData
	this.templates = Array.from( this.children )
	this.templates.map( o=> o.remove() )
	
	for( var i = 0; i < repeat || 10; i++ )
	{
		let object = this.templates[ Math.floor(Math.random() * this.templates.length) ].clone()
		object.position.set(
			Math.random() * radius - radius / 2
		,	Math.random() * radius - radius / 2
		,	Math.random() * radius - radius / 2
		)
		this.add( object )
	}
	
}
