/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import { Placeholder, Toolbar, Spinner, withAPIData } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/utils';

/**
 * Internal dependencies
 */
import './editor.scss';
import './style.scss';
import InspectorControls from '../../inspector-controls';
import BlockControls from '../../block-controls';
import BlockAlignmentToolbar from '../../block-alignment-toolbar';
import MenuPlaceholder from './placeholder';

class NavigationMenuBlock extends Component {
	constructor() {
		super( ...arguments );

		this.setMenu = this.setMenu.bind( this );
		this.renderMenu = this.renderMenu.bind( this );
	}

	setMenu( value ) {
		const { setAttributes } = this.props;
		setAttributes( { selected: value } );
	}

	renderMenu() {
		const { data, isLoading } = this.props.items;
		if ( ! data || isLoading ) {
			return (
				<Placeholder
					key="navigation-menu"
					icon="menu"
					label={ __( 'Navigation Menu' ) }
				>
					{ ! Array.isArray( data ) ?
						<Spinner /> :
						__( 'No items found in this menu.' )
					}
				</Placeholder>
			);
		}

		return (
			<ul key="navigation-menu">
				{ data.map( ( item, i ) => {
					return (
						<li key={ i }>
							{ decodeEntities( item.title.trim() ) || __( '(Untitled)' ) }
						</li>
					);
				} ) }
			</ul>
		);
	}

	render() {
		const { attributes, focus, setAttributes } = this.props;
		const { align, layout, selected } = attributes;
		const menus = this.props.menus.data;

		const inspectorControls = focus && (
			<InspectorControls key="inspector">
				<h3>{ __( 'Menu Settings' ) }</h3>
			</InspectorControls>
		);

		const layoutControls = [
			{
				icon: 'list-view',
				title: __( 'Vertical View' ),
				onClick: () => setAttributes( { layout: 'vertical' } ),
				isActive: layout === 'vertical',
			},
			{
				icon: 'grid-view',
				title: __( 'Horizontal View' ),
				onClick: () => setAttributes( { layout: 'horizontal' } ),
				isActive: layout === 'horizontal',
			},
		];

		let displayBlock = (
			<MenuPlaceholder
				key="navigation-menu"
				menus={ menus }
				selected={ false }
				setMenu={ this.setMenu }
			/>
		);

		if ( !! selected ) {
			displayBlock = this.renderMenu();
		}

		return [
			inspectorControls,
			focus && (
				<BlockControls key="controls">
					<BlockAlignmentToolbar
						value={ align }
						onChange={ ( nextAlign ) => {
							setAttributes( { align: nextAlign } );
						} }
						controls={ [ 'center', 'wide', 'full' ] }
					/>
					<Toolbar controls={ layoutControls } />
				</BlockControls>
			),
			displayBlock,
		];
	}
}

export default withAPIData( props => {
	const { selected } = props.attributes;
	const queryString = selected ? `menus=${ selected }` : '';
	const itemsUrl = selected ? `/wp/v2/menu-items?${ queryString }` : false;

	return {
		menus: '/wp/v2/menus',
		items: itemsUrl,
	};
} )( NavigationMenuBlock );
