function docsMenu()
{
	return fetch('https://threejs.org/docs/list.js').then(res=>res.text())
			.then( s=> s.replace(/^var\s*list\s*=\s*/,'').replace(/,\s*}/g,'}').replace(/;/,'') )
			.then( s=> JSON.parse(s) )
				.then( o=> o.en.Reference )
				.then( ref=> new UI.Menu('Reference').addItems(
								...Object.keys(ref).map( key=> new UI.Menu(key).addItems(
                                    ...Object.keys(ref[key]).map( k=> new UI.MenuItem(k, e=>e) )
                    ) )
				))
}
docsMenu().then( menu=> menubar.add(menu) )

/*
needs some additional css:

#menubar .menu:hover > .options {
    display: flex;
    flex-direction: column;
}

#menubar .menu .options {
  width: initial;
}
.menu .menu > .options {
    margin: -30px 181px;
    z-index: 10000;
    position: relative !important;
} 
*/

function openDocPanel()
{
	new UI.Element( document.body ).add(
		new UI.Panel().add(
			new UI.Element('iframe',{src:`https://threejs.org/docs/index.html#api/en/cameras/OrthographicCamera`})
		)
}

async function createFromDoc( klass )
{
    let doc = await fetch(`https://threejs.org/docs/api/en/${klass}.html`).then(res=>res.text() )
        				.then( html=> (new DOMParser).parseFromString(html,'text/html') )
    ,	cstr = doc.querySelector('h3')
	,	paramsHelp = cstr.nextElementSibling
	,	ui = new UI.Panel()
	
    cstr.textContent.split('(')[1].split(')')[0]
		.split(',').map( s=> s.trim().split(':')[1].slice(0,-1).split(' ') )
            .map( (param,i)=> [...param,cstr.nextElementSibling.childNodes[i*2].textContent.split('--')[1].trim()] )
        .then( params=> params )

}
createFromDoc( 'helpers/GridHelper' )
