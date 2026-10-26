import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { ActivityIndicator, Text } from 'react-native';
import { PropertyListingScreen } from '../screens/PropertyListingScreen';
import { Property } from '../types/property';

jest.mock('../services/propertyService', () => {
  const actual = jest.requireActual('../services/propertyService');
  return {
    ...actual,
    getProperties: jest.fn(),
  };
});

const { getProperties } = jest.requireMock('../services/propertyService') as {
  getProperties: jest.Mock;
};

const sampleProperties: Property[] = [
  {
    id: '1',
    title: 'Sample post 1',
    location: 'Downtown, Dubai Marina',
    price: 625000,
    bedrooms: 2,
    imageUrl: 'https://picsum.photos/seed/property-1/600/400',
  },
];

function findAllText(renderer: ReactTestRenderer.ReactTestRenderer): string[] {
  return renderer.root
    .findAllByType(Text)
    .map(node => node.props.children)
    .flat()
    .filter((value): value is string => typeof value === 'string');
}

describe('PropertyListingScreen', () => {
  beforeEach(() => {
    getProperties.mockReset();
  });

  it('shows a loading indicator while the request is in flight', async () => {
    getProperties.mockReturnValue(new Promise(() => {}));

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<PropertyListingScreen />);
    });

    expect(renderer.root.findAllByType(ActivityIndicator)).toHaveLength(1);
    expect(findAllText(renderer)).toContain('Loading properties…');
  });

  it('renders properties after a successful fetch', async () => {
    getProperties.mockResolvedValue(sampleProperties);

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<PropertyListingScreen />);
    });
    await act(async () => {});

    expect(findAllText(renderer)).toContain('Sample post 1');
  });

  it('shows an empty state when the fetch succeeds with no properties', async () => {
    getProperties.mockResolvedValue([]);

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<PropertyListingScreen />);
    });
    await act(async () => {});

    expect(findAllText(renderer).join(' ')).toMatch(/no properties found/i);
  });

  it('shows an error with a working retry button', async () => {
    getProperties
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(sampleProperties);

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<PropertyListingScreen />);
    });
    await act(async () => {});

    expect(findAllText(renderer)).toContain('boom');

    const retryButton = renderer.root.findByProps({
      accessibilityLabel: 'Retry loading properties',
    });

    await act(async () => {
      (retryButton.props as { onPress: () => void }).onPress();
    });
    await act(async () => {});

    expect(findAllText(renderer)).toContain('Sample post 1');
    expect(getProperties).toHaveBeenCalledTimes(2);
  });

  it('does not surface a cancelled request as an ordinary error', async () => {
    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';
    getProperties.mockRejectedValueOnce(abortError);

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<PropertyListingScreen />);
    });
    await act(async () => {});

    expect(findAllText(renderer)).toContain('Loading properties…');
    expect(renderer.root.findAllByProps({ children: 'Aborted' })).toHaveLength(0);
  });

  it('does not update state after unmount when a request resolves late', async () => {
    let resolveFetch!: (value: Property[]) => void;
    getProperties.mockReturnValue(
      new Promise<Property[]>(resolve => {
        resolveFetch = resolve;
      }),
    );

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<PropertyListingScreen />);
    });

    act(() => {
      renderer.unmount();
    });

    await act(async () => {
      resolveFetch(sampleProperties);
    });
    // No assertion beyond "this doesn't throw / warn" — React would log an
    // act()/state-update warning if the hook updated state after unmount.
  });
});
