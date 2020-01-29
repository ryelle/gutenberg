/**
 * External dependencies
 */
import { get, isUndefined, map, pickBy } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Component, RawHTML } from '@wordpress/element';
import {
	BaseControl,
	PanelBody,
	Placeholder,
	QueryControls,
	RadioControl,
	RangeControl,
	Spinner,
	ToggleControl,
	ToolbarGroup,
} from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { __ } from '@wordpress/i18n';
import { dateI18n, format, __experimentalGetSettings } from '@wordpress/date';
import {
	InspectorControls,
	BlockAlignmentToolbar,
	BlockControls,
	__experimentalImageSizeControl as ImageSizeControl,
} from '@wordpress/block-editor';
import { withSelect } from '@wordpress/data';

/**
 * Module Constants
 */
const CATEGORIES_LIST_QUERY = {
	per_page: -1,
};
const MAX_POSTS_COLUMNS = 6;

// @todo This should be retrieved dynamically, or from site settings, since it can be changed by the site owner.
function getImageDimensionsFromSlug( slug = 'thumbnail' ) {
	switch ( slug ) {
		case 'large':
			return [ 1024, 1024 ];
		case 'medium':
			return [ 300, 300 ];
		case 'thumbnail':
		default:
			return [ 150, 150 ];
	}
}

class LatestPostsEdit extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			categoriesList: [],
		};
	}

	componentDidMount() {
		this.isStillMounted = true;
		this.fetchRequest = apiFetch( {
			path: addQueryArgs( `/wp/v2/categories`, CATEGORIES_LIST_QUERY ),
		} )
			.then( ( categoriesList ) => {
				if ( this.isStillMounted ) {
					this.setState( { categoriesList } );
				}
			} )
			.catch( () => {
				if ( this.isStillMounted ) {
					this.setState( { categoriesList: [] } );
				}
			} );
	}

	componentWillUnmount() {
		this.isStillMounted = false;
	}

	render() {
		const {
			attributes,
			setAttributes,
			getFeaturedMediaSourceUrl,
			imageSizeOptions,
			latestPosts,
		} = this.props;
		const { categoriesList } = this.state;
		const {
			displayFeaturedImage,
			displayPostContentRadio,
			displayPostContent,
			displayPostDate,
			postLayout,
			columns,
			order,
			orderBy,
			categories,
			postsToShow,
			excerptLength,
			imageAlign,
			imageSizeSlug,
			imageSizeWidth,
			imageSizeHeight,
		} = attributes;

		const [ imageWidth, imageHeight ] = getImageDimensionsFromSlug(
			imageSizeSlug
		);

		const inspectorControls = (
			<InspectorControls>
				<PanelBody title={ __( 'Post content settings' ) }>
					<ToggleControl
						label={ __( 'Post Content' ) }
						checked={ displayPostContent }
						onChange={ ( value ) =>
							setAttributes( { displayPostContent: value } )
						}
					/>
					{ displayPostContent && (
						<RadioControl
							label={ __( 'Show:' ) }
							selected={ displayPostContentRadio }
							options={ [
								{ label: __( 'Excerpt' ), value: 'excerpt' },
								{
									label: __( 'Full Post' ),
									value: 'full_post',
								},
							] }
							onChange={ ( value ) =>
								setAttributes( {
									displayPostContentRadio: value,
								} )
							}
						/>
					) }
					{ displayPostContent &&
						displayPostContentRadio === 'excerpt' && (
							<RangeControl
								label={ __( 'Max number of words in excerpt' ) }
								value={ excerptLength }
								onChange={ ( value ) =>
									setAttributes( { excerptLength: value } )
								}
								min={ 10 }
								max={ 100 }
							/>
						) }
				</PanelBody>

				<PanelBody title={ __( 'Post meta settings' ) }>
					<ToggleControl
						label={ __( 'Display post date' ) }
						checked={ displayPostDate }
						onChange={ ( value ) =>
							setAttributes( { displayPostDate: value } )
						}
					/>
				</PanelBody>

				<PanelBody title={ __( 'Featured Image Settings' ) }>
					<ToggleControl
						label={ __( 'Disaply featured image' ) }
						checked={ displayFeaturedImage }
						onChange={ ( value ) =>
							setAttributes( { displayFeaturedImage: value } )
						}
					/>
					{ displayFeaturedImage && (
						<>
							<ImageSizeControl
								onChange={ ( value ) => {
									const newAttrs = {};
									if ( value.hasOwnProperty( 'width' ) ) {
										newAttrs.imageSizeWidth = value.width;
									}
									if ( value.hasOwnProperty( 'height' ) ) {
										newAttrs.imageSizeHeight = value.height;
									}
									setAttributes( newAttrs );
								} }
								slug={ imageSizeSlug }
								width={ imageSizeWidth }
								height={ imageSizeHeight }
								imageWidth={ imageWidth }
								imageHeight={ imageHeight }
								imageSizeOptions={ imageSizeOptions }
								onChangeImage={ ( value ) =>
									setAttributes( {
										imageSizeSlug: value,
										imageSizeWidth: undefined,
										imageSizeHeight: undefined,
									} )
								}
							/>
							<BaseControl>
								<BaseControl.VisualLabel>
									{ __( 'Image Alignment' ) }
								</BaseControl.VisualLabel>
								<BlockAlignmentToolbar
									value={ imageAlign }
									onChange={ ( value ) =>
										setAttributes( { imageAlign: value } )
									}
									controls={ [ 'left', 'center', 'right' ] }
									isCollapsed={ false }
								/>
							</BaseControl>
						</>
					) }
				</PanelBody>

				<PanelBody title={ __( 'Sorting and filtering' ) }>
					<QueryControls
						{ ...{ order, orderBy } }
						numberOfItems={ postsToShow }
						categoriesList={ categoriesList }
						selectedCategoryId={ categories }
						onOrderChange={ ( value ) =>
							setAttributes( { order: value } )
						}
						onOrderByChange={ ( value ) =>
							setAttributes( { orderBy: value } )
						}
						onCategoryChange={ ( value ) =>
							setAttributes( {
								categories: '' !== value ? value : undefined,
							} )
						}
						onNumberOfItemsChange={ ( value ) =>
							setAttributes( { postsToShow: value } )
						}
					/>
					{ postLayout === 'grid' && (
						<RangeControl
							label={ __( 'Columns' ) }
							value={ columns }
							onChange={ ( value ) =>
								setAttributes( { columns: value } )
							}
							min={ 2 }
							max={
								! hasPosts
									? MAX_POSTS_COLUMNS
									: Math.min(
											MAX_POSTS_COLUMNS,
											latestPosts.length
									  )
							}
							required
						/>
					) }
				</PanelBody>
			</InspectorControls>
		);

		const hasPosts = Array.isArray( latestPosts ) && latestPosts.length;
		if ( ! hasPosts ) {
			return (
				<>
					{ inspectorControls }
					<Placeholder
						icon="admin-post"
						label={ __( 'Latest Posts' ) }
					>
						{ ! Array.isArray( latestPosts ) ? (
							<Spinner />
						) : (
							__( 'No posts found.' )
						) }
					</Placeholder>
				</>
			);
		}

		// Removing posts from display should be instant.
		const displayPosts =
			latestPosts.length > postsToShow
				? latestPosts.slice( 0, postsToShow )
				: latestPosts;

		const layoutControls = [
			{
				icon: 'list-view',
				title: __( 'List view' ),
				onClick: () => setAttributes( { postLayout: 'list' } ),
				isActive: postLayout === 'list',
			},
			{
				icon: 'grid-view',
				title: __( 'Grid view' ),
				onClick: () => setAttributes( { postLayout: 'grid' } ),
				isActive: postLayout === 'grid',
			},
		];

		const dateFormat = __experimentalGetSettings().formats.date;

		return (
			<>
				{ inspectorControls }
				<BlockControls>
					<ToolbarGroup controls={ layoutControls } />
				</BlockControls>
				<ul
					className={ classnames( this.props.className, {
						'wp-block-latest-posts__list': true,
						'is-grid': postLayout === 'grid',
						'has-dates': displayPostDate,
						[ `columns-${ columns }` ]: postLayout === 'grid',
					} ) }
				>
					{ displayPosts.map( ( post, i ) => {
						const titleTrimmed = post.title.rendered.trim();
						let excerpt = post.excerpt.rendered;

						const excerptElement = document.createElement( 'div' );
						excerptElement.innerHTML = excerpt;

						excerpt =
							excerptElement.textContent ||
							excerptElement.innerText ||
							'';

						const imageSourceUrl = getFeaturedMediaSourceUrl(
							post.featured_media,
							imageSizeSlug
						);
						const imageClasses = classnames( [
							'wp-block-latest-posts__featured-image',
							imageAlign && `align${ imageAlign }`,
						] );

						return (
							<li key={ i }>
								{ displayFeaturedImage && (
									<div className={ imageClasses }>
										{ imageSourceUrl && (
											<img
												src={ imageSourceUrl }
												alt=""
												style={ {
													maxWidth: imageSizeWidth,
													maxHeight: imageSizeHeight,
												} }
											/>
										) }
									</div>
								) }
								<a
									href={ post.link }
									target="_blank"
									rel="noreferrer noopener"
								>
									{ titleTrimmed ? (
										<RawHTML>{ titleTrimmed }</RawHTML>
									) : (
										__( '(no title)' )
									) }
								</a>
								{ displayPostDate && post.date_gmt && (
									<time
										dateTime={ format(
											'c',
											post.date_gmt
										) }
										className="wp-block-latest-posts__post-date"
									>
										{ dateI18n(
											dateFormat,
											post.date_gmt
										) }
									</time>
								) }
								{ displayPostContent &&
									displayPostContentRadio === 'excerpt' && (
										<div className="wp-block-latest-posts__post-excerpt">
											<RawHTML key="html">
												{ excerptLength <
												excerpt.trim().split( ' ' )
													.length
													? excerpt
															.trim()
															.split(
																' ',
																excerptLength
															)
															.join( ' ' ) +
													  ' ... <a href=' +
													  post.link +
													  'target="_blank" rel="noopener noreferrer">' +
													  __( 'Read more' ) +
													  '</a>'
													: excerpt
															.trim()
															.split(
																' ',
																excerptLength
															)
															.join( ' ' ) }
											</RawHTML>
										</div>
									) }
								{ displayPostContent &&
									displayPostContentRadio === 'full_post' && (
										<div className="wp-block-latest-posts__post-full-content">
											<RawHTML key="html">
												{ post.content.raw.trim() }
											</RawHTML>
										</div>
									) }
							</li>
						);
					} ) }
				</ul>
			</>
		);
	}
}

export default withSelect( ( select, props ) => {
	const { postsToShow, order, orderBy, categories } = props.attributes;
	const { getSettings } = select( 'core/block-editor' );
	const { imageSizes } = getSettings();
	const { getEntityRecords, getMedia } = select( 'core' );
	const latestPostsQuery = pickBy(
		{
			categories,
			order,
			orderby: orderBy,
			per_page: postsToShow,
		},
		( value ) => ! isUndefined( value )
	);
	return {
		imageSizeOptions: map( imageSizes, ( { name, slug } ) => ( {
			value: slug,
			label: name,
		} ) ),
		// @todo get size dynamically based on size selected.
		getFeaturedMediaSourceUrl( featuredImageId, sizeSlug ) {
			if ( featuredImageId ) {
				const image = getMedia( featuredImageId );
				const url = get(
					image,
					[ 'media_details', 'sizes', sizeSlug, 'source_url' ],
					null
				);
				if ( ! url ) {
					return get( image, 'source_url', null );
				}
				return url;
			}
			return null;
		},
		latestPosts: getEntityRecords( 'postType', 'post', latestPostsQuery ),
	};
} )( LatestPostsEdit );
