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



/* Base class for menus (ColumnMenu, RowMenu, etc) */



const Element = require( './Element.js' ) ;
const Button = require( './Button.js' ) ;



function BaseMenu( options = {} , defaultOptions ) {
	Element.call( this , options ) ;

	this.backgroundAttr = options.backgroundAttr || { bgColor: 'white' } ;
	this.contentEllipsis = options.contentEllipsis || '…' ;
	this.previousPageContent = options.previousPageContent || '«' ;
	this.previousPageContentHasMarkup = !! options.previousPageContentHasMarkup ;
	this.nextPageContent = options.nextPageContent || '»' ;
	this.nextPageContentHasMarkup = !! options.nextPageContentHasMarkup ;
	this.itemsDef = options.items || [] ;
	this.buttons = [] ;
	this.focusChild = null ;

	// Pagination
	this.page = 0 ;
	this.maxPage = 0 ;

	this.onButtonSubmit = this.onButtonSubmit.bind( this ) ;
	this.onKey = this.onKey.bind( this ) ;
	this.onFocus = this.onFocus.bind( this ) ;

	// Global default attributes
	this.buttonFocusAttr = options.buttonFocusAttr || defaultOptions.buttonFocusAttr || { bgColor: 'white' , color: 'black' , bold: true } ;
	this.buttonBlurAttr = options.buttonBlurAttr || defaultOptions.buttonBlurAttr || { bgColor: 'black' , color: 'white' , bold: true } ;
	this.buttonDisabledAttr = options.buttonDisabledAttr || defaultOptions.buttonDisabledAttr || { bgColor: 'black' , color: 'brightBlack' , bold: true } ;
	this.buttonSubmittedAttr = options.buttonSubmittedAttr || defaultOptions.buttonSubmittedAttr || { bgColor: 'brightBlack' , color: 'brightWhite' , bold: true } ;

	// Padding
	this.blurLeftPadding = options.blurLeftPadding || options.leftPadding || '' ;
	this.blurRightPadding = options.blurRightPadding || options.rightPadding || '' ;
	this.focusLeftPadding = options.focusLeftPadding || options.leftPadding || '' ;
	this.focusRightPadding = options.focusRightPadding || options.rightPadding || '' ;
	this.disabledLeftPadding = options.disabledLeftPadding || options.leftPadding || '' ;
	this.disabledRightPadding = options.disabledRightPadding || options.rightPadding || '' ;
	this.submittedLeftPadding = options.submittedLeftPadding || options.leftPadding || '' ;
	this.submittedRightPadding = options.submittedRightPadding || options.rightPadding || '' ;
	this.paddingHasMarkup = !! options.paddingHasMarkup ;

	if ( options.keyBindings ) { this.keyBindings = options.keyBindings ; }

	this.on( 'key' , this.onKey ) ;
	this.on( 'focus' , this.onFocus ) ;
}

module.exports = BaseMenu ;

BaseMenu.prototype = Object.create( Element.prototype ) ;
BaseMenu.prototype.constructor = BaseMenu ;
BaseMenu.prototype.elementType = 'BaseMenu' ;



BaseMenu.prototype.destroy = function( isSubDestroy ) {
	this.off( 'key' , this.onKey ) ;
	this.off( 'focus' , this.onFocus ) ;

	Element.prototype.destroy.call( this , isSubDestroy ) ;
} ;



BaseMenu.prototype.previousPage = function( focusType ) {
	if ( this.maxPage && this.page > 0 ) {
		this.page -- ;
		this.initPage() ;
		this.focusChild = this.children[ this.children.length - 2 ] ;
		this.document.giveFocusTo_( this.focusChild , focusType ) ;
		this.draw() ;
	}
} ;



BaseMenu.prototype.nextPage = function( focusType ) {
	if ( this.maxPage && this.page < this.maxPage ) {
		this.page ++ ;
		this.initPage() ;
		this.focusChild = this.children[ 1 ] ;
		this.document.giveFocusTo_( this.focusChild , focusType ) ;
		this.draw() ;
	}
} ;



BaseMenu.prototype.onKey = function( key , trash , data ) {
	switch( this.keyBindings[ key ] ) {
		case 'previous' :
			this.focusChild = this.focusPreviousChild( ! this.maxPage ) ;
			if ( this.focusChild === this.children[ 0 ] && this.maxPage && this.page > 0 ) {
				this.previousPage( 'cycle' ) ;
			}
			break ;
		case 'next' :
			this.focusChild = this.focusNextChild( ! this.maxPage ) ;
			if ( this.focusChild === this.children[ this.children.length - 1 ] && this.maxPage && this.page < this.maxPage ) {
				this.nextPage( 'cycle' ) ;
			}
			break ;
		default :
			return ;	// Bubble up
	}

	return true ;	// Do not bubble up
} ;



BaseMenu.prototype.onFocus = function( focus , type ) {
	if ( type === 'cycle' ) { return ; }

	if ( focus ) {
		if ( this.focusChild ) { this.document.giveFocusTo( this.focusChild , 'delegate' ) ; }
		else { this.focusChild = this.focusNextChild() ; }
	}
} ;



BaseMenu.prototype.onButtonSubmit = function( buttonValue , trash , button ) {
	if ( button.internalRole === 'previousPage' ) {
		this.previousPage() ;
	}
	else if ( button.internalRole === 'nextPage' ) {
		this.nextPage() ;
	}
	else {
		this.emit( 'submit' , buttonValue , undefined , this ) ;
	}
} ;



BaseMenu.prototype.initPage = function() {
} ;

