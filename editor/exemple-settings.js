Sidebar.Settings = editor=> {
   	container=			new UI.Panel().setBorderTop( '0' ).setPaddingTop( '20px' ).add(
   			  			   new UI.Row().add(
   			  			       new UI.Text( 'Theme' ).setWidth( '90px' ),
	theme=	  			       new UI.Select().setWidth( '150px' )
   			  			           .setOptions({
   			  			               'css/light.css': 'light',
   			  			               'css/dark.css': 'dark'
   			  			           })
   			  			           .onChange( function () {
						
   			  			               var value = this.getValue()
						
   			  			               editor.setTheme( value )
   			  			               editor.config.setKey( 'theme', value )
						
   			  			           } )
   			  			   )
   						 )	
	
	editor.config.getKey( 'theme' ) !== undefined &&
		theme.setValue( editor.config.getKey( 'theme' ) )
}
	
