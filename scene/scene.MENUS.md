# dat.GUI plugin

## Declare a menu

```
const UI = Symbol.gui

scene.MENUS.MenuNamespace = {
// or
let menu = scene.MENUS.MenuNamespace = {
		other: {
			normal: true
		,	text: "aze"
				[UI]( onChange=> function(e){ alert(this) } )
		,	a:46
				[UI]( 
					onChange=> e=> alert( "change" ) || console.log( this, e )
				,	step=> 4
				,	min=> 23
				,	max=> 67
				)
		,	num: 12
				[UI]( 0 ,50 ,10 )
		}
	,	"settings": {
			"Simple text": "hello"
		,	"Simple number": 42
		,	"Checkbox": true
		,	"Button": ()=> doSomething()
		,	SOME_CONSTANT: Another.SOME_CONSTANT
				[UI]( name=>'Change to better name')
		}
}

// method 2 afterward ( it replace any previoous declaration )

menu.other.text[UI]( function onChange(){} )
menu.other.num[UI]( 11,22, function step(){} )
```