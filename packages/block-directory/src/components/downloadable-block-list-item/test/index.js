/**
 * External dependencies
 */
import { render, fireEvent } from '@testing-library/react';

/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import DownloadableBlockListItem from '../';
import { plugin } from '../../test/fixtures';

jest.mock( '@wordpress/data/src/components/use-select', () => {
	// This allows us to tweak the returned value on each test
	const mock = jest.fn();
	return mock;
} );

describe( 'DownloadableBlockListItem', () => {
	it( 'should render a block item', () => {
		useSelect.mockImplementation( () => ( {
			isLoading: false,
			isInstallable: true,
		} ) );

		const { container } = render(
			<DownloadableBlockListItem onClick={ jest.fn() } item={ plugin } />
		);

		expect( container ).toMatchSnapshot();
	} );

	it( 'should try to install the block plugin', () => {
		const onClick = jest.fn();
		const { container } = render(
			<DownloadableBlockListItem onClick={ onClick } item={ plugin } />
		);

		const button = container.querySelector(
			'.block-directory-downloadable-block-list-item__item'
		);
		fireEvent.click( button );

		expect( onClick ).toHaveBeenCalledTimes( 1 );
	} );
} );
