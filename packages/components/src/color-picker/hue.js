/**
 * Parts of this source were derived and modified from react-color,
 * released under the MIT license.
 *
 * https://github.com/casesandberg/react-color/
 *
 * Copyright (c) 2015 Case Sandberg
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { calculateHueChange } from './utils';
import KeyboardShortcuts from '../keyboard-shortcuts';

export class Hue extends Component {
	constructor() {
		super( ...arguments );

		this.increase = this.increase.bind( this );
		this.decrease = this.decrease.bind( this );
		this.handleChange = this.handleChange.bind( this );
		this.handleMouseDown = this.handleMouseDown.bind( this );
		this.handleMouseUp = this.handleMouseUp.bind( this );
	}

	componentWillUnmount() {
		this.unbindEventListeners();
	}

	increase( amount = 1 ) {
		const { hsl, onChange = noop } = this.props;
		const change = {
			h: hsl.h + amount >= 359 ? 359 : hsl.h + amount,
			s: hsl.s,
			l: hsl.l,
			a: hsl.a,
			source: 'rgb',
		};
		onChange( change );
	}

	decrease( amount = 1 ) {
		const { hsl, onChange = noop } = this.props;
		const change = {
			h: hsl.h <= amount ? 0 : hsl.h - amount,
			s: hsl.s,
			l: hsl.l,
			a: hsl.a,
			source: 'rgb',
		};
		onChange( change );
	}

	handleChange( e ) {
		const { onChange = noop } = this.props;
		const change = calculateHueChange( e, this.props, this.container );
		if ( change ) {
			onChange( change, e );
		}
	}

	handleMouseDown( e ) {
		this.handleChange( e );
		window.addEventListener( 'mousemove', this.handleChange );
		window.addEventListener( 'mouseup', this.handleMouseUp );
	}

	handleMouseUp() {
		this.unbindEventListeners();
	}

	unbindEventListeners() {
		window.removeEventListener( 'mousemove', this.handleChange );
		window.removeEventListener( 'mouseup', this.handleMouseUp );
	}

	render() {
		const { hsl = {} } = this.props;
		const pointerLocation = { left: `${ ( hsl.h * 100 ) / 360 }%` };
		const shortcuts = {
			up: () => this.increase(),
			right: () => this.increase(),
			'shift+up': () => this.increase( 10 ),
			'shift+right': () => this.increase( 10 ),
			pageup: () => this.increase( 10 ),
			end: () => this.increase( 359 ),
			down: () => this.decrease(),
			left: () => this.decrease(),
			'shift+down': () => this.decrease( 10 ),
			'shift+left': () => this.decrease( 10 ),
			pagedown: () => this.decrease( 10 ),
			home: () => this.decrease( 359 ),
		};

		return (
			<KeyboardShortcuts shortcuts={ shortcuts }>
				<div className="components-color-picker__hue">
					<div className="components-color-picker__hue-gradient" />
					{ /* eslint-disable jsx-a11y/no-static-element-interactions */ }
					<div
						className="components-color-picker__hue-bar"
						ref={ ( container ) => ( this.container = container ) }
						onMouseDown={ this.handleMouseDown }
						onTouchMove={ this.handleChange }
						onTouchStart={ this.handleChange }>
						<button
							role="slider"
							aria-valuemax="1"
							aria-valuemin="359"
							aria-valuenow={ hsl.h }
							aria-orientation="horizontal"
							aria-label={ __(
								'Hue value in degrees, from 0 to 359.'
							) }
							className="components-color-picker__hue-pointer"
							style={ pointerLocation }
						/>
					</div>
					{ /* eslint-enable jsx-a11y/no-static-element-interactions */ }
				</div>
			</KeyboardShortcuts>
		);
	}
}

export default Hue;
