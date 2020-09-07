/**
 * WordPress dependencies
 */
import { __, _n, sprintf } from '@wordpress/i18n';
import { compose } from '@wordpress/compose';
import { Button, Spinner, withSpokenMessages } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import DownloadableBlocksList from '../downloadable-blocks-list';

function DownloadableBlocksPanel( {
	downloadableItems,
	onSelect,
	onHover,
	hasItems,
	hasPermission,
	isLoading,
	isWaiting,
	debouncedSpeak,
} ) {
	const [ isPanelOpen, setPanelOpen ] = useState( false );

	if ( typeof hasPermission === 'undefined' || isLoading || isWaiting ) {
		return (
			<p className="block-directory-downloadable-blocks-panel__description has-no-results">
				<Spinner />
			</p>
		);
	}

	if ( false === hasPermission ) {
		if ( ! hasItems ) {
			debouncedSpeak( __( 'No blocks found in your library.' ) );
			return (
				<p className="block-directory-downloadable-blocks-panel__description has-no-results">
					{ __( 'No blocks found in your library.' ) }
				</p>
			);
		}

		return null;
	}

	if ( ! isPanelOpen && downloadableItems.length ) {
		return (
			<div className="block-directory-downloadable-blocks-panel">
				<h2 className="block-directory-downloadable-blocks-panel__title">
					{ hasItems
						? __( 'More blocks to use' )
						: __( 'No installed blocks found' ) }
				</h2>
				<p className="block-directory-downloadable-blocks-panel__description">
					{ sprintf(
						/* translators: %d: number of available blocks. */
						_n(
							'%d additional block is available to install.',
							'%d additional blocks are available to install.',
							downloadableItems.length
						),
						downloadableItems.length
					) }
				</p>
				<Button
					isPrimary
					onClick={ () => setPanelOpen( ! isPanelOpen ) }
				>
					{ sprintf(
						/* translators: %d: number of available blocks. */
						_n(
							'Show %d block',
							'Show %d blocks',
							downloadableItems.length
						),
						downloadableItems.length
					) }
				</Button>
			</div>
		);
	}

	return (
		<div className="block-directory-downloadable-blocks-panel">
			<h2>
				{ sprintf(
					/* translators: %d: number of available blocks. */
					_n(
						'Showing %d available block',
						'Showing %d available blocks',
						downloadableItems.length
					),
					downloadableItems.length
				) }
			</h2>
			<p className="block-directory-downloadable-blocks-panel__description">
				{ __( 'These blocks can be downloaded and installed:' ) }
			</p>
			<DownloadableBlocksList
				items={ downloadableItems }
				onSelect={ onSelect }
				onHover={ onHover }
			/>
		</div>
	);
}

export default compose( [
	withSpokenMessages,
	withSelect( ( select, { filterValue } ) => {
		const {
			getDownloadableBlocks,
			isRequestingDownloadableBlocks,
		} = select( 'core/block-directory' );

		const hasPermission = select( 'core' ).canUser(
			'read',
			'block-directory/search'
		);
		const downloadableItems = hasPermission
			? getDownloadableBlocks( filterValue )
			: [];
		const isLoading = isRequestingDownloadableBlocks( filterValue );

		return {
			downloadableItems,
			hasPermission,
			isLoading,
		};
	} ),
] )( DownloadableBlocksPanel );
