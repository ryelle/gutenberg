/**
 * WordPress dependencies
 */
import Button from 'components/button';
import Placeholder from 'components/placeholder';
import HtmlEmbed from 'components/html-embed';

/**
 * Internal dependencies
 */
import './style.scss';
import { registerBlock, query } from '../../api';
import { serializeBlock } from '../../api/serializer';
import Editable from '../../editable';

const { attr, children } = query;

/**
 * Returns an attribute setter with behavior that if the target value is
 * already the assigned attribute value, it will be set to undefined.
 *
 * @param  {string}   align Alignment value
 * @return {Function}       Attribute setter
 */
function toggleAlignment( align ) {
	return ( attributes, setAttributes ) => {
		const nextAlign = attributes.align === align ? undefined : align;
		setAttributes( { align: nextAlign } );
	};
}

registerBlock( 'core/embed', {
	title: wp.i18n.__( 'Embed' ),

	icon: 'video-alt3',

	category: 'embed',

	attributes: {
		title: attr( 'iframe', 'title' ),
		caption: children( 'figcaption' ),
	},

	controls: [
		{
			icon: 'align-left',
			title: wp.i18n.__( 'Align left' ),
			isActive: ( { align } ) => 'left' === align,
			onClick: toggleAlignment( 'left' ),
		},
		{
			icon: 'align-center',
			title: wp.i18n.__( 'Align center' ),
			isActive: ( { align } ) => ! align || 'center' === align,
			onClick: toggleAlignment( 'center' ),
		},
		{
			icon: 'align-right',
			title: wp.i18n.__( 'Align right' ),
			isActive: ( { align } ) => 'right' === align,
			onClick: toggleAlignment( 'right' ),
		},
		{
			icon: 'align-full-width',
			title: wp.i18n.__( 'Wide width' ),
			isActive: ( { align } ) => 'wide' === align,
			onClick: toggleAlignment( 'wide' ),
		},
	],

	getEditWrapperProps( attributes ) {
		const { align } = attributes;
		if ( 'left' === align || 'right' === align || 'wide' === align ) {
			return { 'data-align': align };
		}
	},

	edit: class extends wp.element.Component {
		constructor() {
			super( ...arguments );
			this.doServerSideRender = this.doServerSideRender.bind( this );
			// Copies the block's url so we can edit it without having the block update
			this.state = {
				oEmbedHtml: '',
				error: false,
				fetching: false,
			};
			this.noPreview = [
				'facebook.com',
			];
			this.videoEmbeds = [
				'youtube.com',
				'youtu.be',
				'vimeo.com',
				'dailymotion.com',
				'dai.ly',
				'hulu.com',
				'wordpress.tv',
				'funnyordie.com',
				'collegehumor.com',
			];
		}

		doServerSideRender( event ) {
			event.preventDefault();
			const api_url = '/?rest_route=/gutenburg/v1/render/';
			const { url } = this.props.attributes;
			const form = new FormData();
			// core/oembed is a server side block for rendering the WP_oEmbed functionality
			const oembed_block = serializeBlock( {
				type: 'core/oembed',
				attributes: { url },
				settings: {},
				saveContent: '',
			} );
			form.append( 'content', oembed_block );
			this.setState( { error: false, fetching: true } );
			fetch( api_url, {
				method: 'POST',
				body: form,
			} ).then(
				( response ) => {
					response.json().then( ( obj ) => {
						const html = obj.html.trim();
						if ( html ) {
							this.setState( { oEmbedHtml: html } );
						} else {
							this.setState( { error: true } );
						}
						this.setState( { fetching: false } );
					} );
				}
			);
		}

		render() {
			const { oEmbedHtml, error, fetching } = this.state;
			const { url, caption } = this.props.attributes;
			const { setAttributes, focus, setFocus } = this.props;

			if ( ! oEmbedHtml ) {
				return (
					<Placeholder icon="cloud" label={ wp.i18n.__( 'Embed URL' ) } className="blocks-embed">
						<form onSubmit={ this.doServerSideRender }>
							<input
								type="url"
								className="placeholder__input"
								placeholder={ wp.i18n.__( 'Enter URL to embed here...' ) }
								onChange={ ( event ) => setAttributes( { url: event.target.value } ) } />
							{ ! fetching ?
								(
									<Button
										isLarge
										type="submit">
										{ wp.i18n.__( 'Embed' ) }
									</Button>
								) : (
									<span className="spinner is-active" />
								)
							}
							{ ( error ) ? (
								<p className="components-placeholder__error">{ wp.i18n.__( 'Sorry, we could not embed that content.' ) }</p>
							) : null }
						</form>
					</Placeholder>
				);
			}

			const domain = url.split( '/' )[ 2 ].replace( /^www\./, '' );
			const cannotPreview = this.noPreview.includes( domain );

			return (
				<figure>
					{ ( cannotPreview ) ? (
						<Placeholder icon="cloud" label={ wp.i18n.__( 'Embed URL' ) } className="blocks-embed">
							<p className="components-placeholder__error"><a href={ url }>{ url }</a></p>
							<p className="components-placeholder__error">{ wp.i18n.__( 'Previews for this are unavailable in the editor, sorry!' ) }</p>
						</Placeholder>
					) : (
						<HtmlEmbed html={ oEmbedHtml } />
					) }
					{ ( caption && caption.length > 0 ) || !! focus ? (
						<Editable
							tagName="figcaption"
							placeholder={ wp.i18n.__( 'Write caption…' ) }
							value={ caption }
							focus={ focus }
							onFocus={ setFocus }
							onChange={ ( value ) => setAttributes( { caption: value } ) }
							inline
							inlineToolbar
						/>
					) : null }
				</figure>
			);
		}
	},

	save( { attributes } ) {
		const { url, caption } = attributes;
		if ( ! caption || ! caption.length ) {
			return url;
		}

		return (
			<figure>
				{ url }
				<figcaption>{ caption }</figcaption>
			</figure>
		);
	},
} );
