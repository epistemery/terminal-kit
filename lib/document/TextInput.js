/*
	Terminal Kit

	Copyright (c) 2009 - 2019 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



const Element = require( './Element.js' ) ;
const Text = require( './Text.js' ) ;
const EditableTextBox = require( './EditableTextBox.js' ) ;

const string = require( 'string-kit' ) ;
//const autoComplete = require( './autoComplete.js' ) ;



function TextInput( options = {} ) {
	Element.call( this , options ) ;

	// TextBufffer needs computed attr, not object one
	this.textAttr = options.textAttr || { bgColor: 'blue' } ;
	this.emptyAttr = options.emptyAttr || { bgColor: 'blue' } ;

	this.hidden = options.hidden ;

	this.labelFocusAttr = options.labelFocusAttr || { bold: true } ;
	this.labelBlurAttr = options.labelBlurAttr || { dim: true } ;

	if ( options.keyBindings ) { this.keyBindings = options.keyBindings ; }

	if ( options.editableTextBoxKeyBindings ) { this.editableTextBoxKeyBindings = options.editableTextBoxKeyBindings ; }
	else if ( options.allowNewLine ) { this.editableTextBoxKeyBindings = this.multiLineEditableTextBoxKeyBindings ; }

	if ( this.label ) {
		this.labelText = new Text( {
			parent: this ,
			content: this.label ,
			x: this.outputX ,
			y: this.outputY ,
			height: 1 ,
			attr: this.labelBlurAttr ,
			leftPadding: this.labelBlurLeftPadding ,
			rightPadding: this.labelBlurRightPadding ,
			noDraw: true
		} ) ;
	}

	this.editableTextBox = new EditableTextBox( {
		parent: this ,
		content: options.content ,
		value: options.value ,
		x: this.outputX + ( this.labelText ? this.labelText.outputWidth : 0 ) ,
		y: this.outputY ,
		width: this.outputWidth - ( this.labelText ? this.labelText.outputWidth : 0 ) ,
		height: this.outputHeight ,
		hidden: this.hidden ,
		textAttr: this.textAttr ,
		emptyAttr: this.emptyAttr ,
		keyBindings: this.editableTextBoxKeyBindings ,
		noDraw: true
	} ) ;

	this.updateStatus() ;

	this.onKey = this.onKey.bind( this ) ;
	this.onFocus = this.onFocus.bind( this ) ;
	this.onClick = this.onClick.bind( this ) ;

	this.on( 'key' , this.onKey ) ;
	this.on( 'focus' , this.onFocus ) ;
	this.on( 'click' , this.onClick ) ;

	// Only draw if we are not a superclass of the object
	if ( this.elementType === 'TextInput' && ! options.noDraw ) { this.draw() ; }
}

module.exports = TextInput ;

TextInput.prototype = Object.create( Element.prototype ) ;
TextInput.prototype.constructor = TextInput ;
TextInput.prototype.elementType = 'TextInput' ;



TextInput.prototype.noChildFocus = true ;



TextInput.prototype.destroy = function( isSubDestroy ) {
	this.off( 'key' , this.onKey ) ;
	this.off( 'focus' , this.onFocus ) ;
	this.off( 'click' , this.onClick ) ;

	Element.prototype.destroy.call( this , isSubDestroy ) ;
} ;



TextInput.prototype.keyBindings = {
	ENTER: 'submit' ,
	KP_ENTER: 'submit' ,
	ALT_ENTER: 'submit'
	//ESCAPE: 'cancel' ,
} ;



TextInput.prototype.editableTextBoxKeyBindings = {
	BACKSPACE: 'backDelete' ,
	DELETE: 'delete' ,
	LEFT: 'backward' ,
	RIGHT: 'forward' ,
	CTRL_LEFT: 'startOfWord' ,
	CTRL_RIGHT: 'endOfWord' ,
	HOME: 'startOfLine' ,
	END: 'endOfLine'
} ;



TextInput.prototype.multiLineEditableTextBoxKeyBindings = Object.assign( {} , TextInput.prototype.editableTextBoxKeyBindings , {
	ENTER: 'newLine' ,
	KP_ENTER: 'newLine' ,
	UP: 'up' ,
	DOWN: 'down'
} ) ;



// Directly linked to the EditableTextBox
TextInput.prototype.getValue = function() { return this.editableTextBox.getValue() ; } ;
TextInput.prototype.setValue = function( value , dontDraw ) { return this.editableTextBox.setValue( value , dontDraw ) ; } ;
TextInput.prototype.getContent = function() { return this.editableTextBox.getContent() ; } ;
TextInput.prototype.setContent = function( content , hasMarkup , dontDraw ) { return this.editableTextBox.setContent( content , hasMarkup , dontDraw ) ; } ;



TextInput.prototype.onKey = function( key , altKeys , data ) {
	// Give full priority to the child editableTextBox
	if ( this.editableTextBox.emit( 'key' , key , altKeys , data ).interrupt ) { return true ; }

	switch( this.keyBindings[ key ] ) {
		case 'submit' :
			this.emit( 'submit' , this.editableTextBox.getValue() , undefined , this ) ;
			break ;

		default :
			return ;
	}

	return true ;		// Do not bubble up
} ;



TextInput.prototype.drawSelfCursor = function() {
	this.editableTextBox.drawSelfCursor() ;
} ;



TextInput.prototype.onFocus = function( focus , type ) {
	this.hasFocus = focus ;
	this.updateStatus() ;
	this.draw() ;
} ;



TextInput.prototype.onClick = function( data ) {
	this.document.giveFocusTo( this , 'select' ) ;
} ;



TextInput.prototype.updateStatus = function() {
	/*
	if ( this.disabled ) {
		this.labelText.attr = this.labelDisabledAttr ;
		this.labelText.leftPadding = this.labelDisabledLeftPadding ;
		this.labelText.rightPadding = this.labelDisabledRightPadding ;
	}
	else if ( this.submitted ) {
		this.labelText.attr = this.labelSubmittedAttr ;
		this.labelText.leftPadding = this.labelSubmittedLeftPadding ;
		this.labelText.rightPadding = this.labelSubmittedRightPadding ;
	}
	else */
	if ( this.hasFocus ) {
		if ( this.labelText ) {
			this.labelText.attr = this.labelFocusAttr ;
			this.labelText.leftPadding = this.labelFocusLeftPadding ;
			this.labelText.rightPadding = this.labelFocusRightPadding ;
		}
	}
	else if ( this.labelText ) {
		this.labelText.attr = this.labelBlurAttr ;
		this.labelText.leftPadding = this.labelBlurLeftPadding ;
		this.labelText.rightPadding = this.labelBlurRightPadding ;
	}
} ;

