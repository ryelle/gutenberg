/**
 * External dependencies
 */
import { Composite, useCompositeState } from 'reakit';
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import DownloadableBlockListItem from '../downloadable-block-list-item';

function DownloadableBlocksList( { items, onHover = noop, onSelect } ) {
	const composite = useCompositeState();
	const { installBlockType } = useDispatch( 'core/block-directory' );
	const { setIsInserterOpened } = useDispatch( 'core/edit-post' );

	if ( ! items.length ) {
		return null;
	}

	return (
		<Composite
			{ ...composite }
			role="listbox"
			className="block-directory-downloadable-blocks-list"
			aria-label={ __( 'Blocks available for install' ) }
		>
			{ items.map( ( item ) => {
				return (
					<DownloadableBlockListItem
						key={ item.id }
						composite={ composite }
						onClick={ () => {
							installBlockType( item ).then( ( success ) => {
								if ( success ) {
									onSelect( item );
									setIsInserterOpened( false );
								}
							} );
							onHover( null );
						} }
						onHover={ onHover }
						item={ item }
					/>
				);
			} ) }
		</Composite>
	);
}

export default DownloadableBlocksList;
