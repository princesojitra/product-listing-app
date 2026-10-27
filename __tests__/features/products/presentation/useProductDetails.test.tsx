import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import { useProductDetails } from '../../../../src/features/products/presentation/hooks/useProductDetails';
import { ProductDetails } from '../../../../src/features/products/domain/models/ProductDetails';
import { GetProductDetails } from '../../../../src/features/products/domain/usecases/GetProductDetails';

function productFor(id: string): ProductDetails {
  return {
    id,
    title: `Product ${id}`,
    description: 'desc',
    price: 1,
    discountPercentage: 0,
    category: 'misc',
    rating: 1,
    brand: null,
    sku: 'SKU-1',
    weight: 1,
    dimensions: { width: 1, height: 1, depth: 1 },
    warrantyInformation: 'No warranty',
    shippingInformation: 'Ships in 1 week',
    stock: 1,
    availabilityStatus: 'In Stock',
    returnPolicy: 'No return policy',
    minimumOrderQuantity: 1,
    tags: [],
    reviews: [],
    imageUrl: 'https://example.com/img.png',
    images: ['https://example.com/img.png'],
  };
}

function HookHarness({
  id,
  getProductDetails,
}: {
  id: string;
  getProductDetails: GetProductDetails;
}) {
  const { state } = useProductDetails(id, getProductDetails);
  return <Text>{state.status === 'success' ? state.data.title : state.status}</Text>;
}

function textOf(renderer: ReactTestRenderer.ReactTestRenderer): string {
  return renderer.root.findByType(Text).props.children;
}

describe('useProductDetails', () => {
  it('does not let a late-resolving request for a previous id overwrite the current id', async () => {
    let resolveFirst!: (value: ProductDetails) => void;
    let resolveSecond!: (value: ProductDetails) => void;
    const getProductDetails: jest.MockedFunction<GetProductDetails> = jest
      .fn()
      .mockImplementationOnce(
        () => new Promise<ProductDetails>(resolve => (resolveFirst = resolve)),
      )
      .mockImplementationOnce(
        () => new Promise<ProductDetails>(resolve => (resolveSecond = resolve)),
      );

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <HookHarness id="1" getProductDetails={getProductDetails} />,
      );
    });
    expect(textOf(renderer)).toBe('loading');

    // Switch to a different product while the first request is still
    // pending — this aborts the id "1" request and starts a new one for "2".
    await act(async () => {
      renderer.update(<HookHarness id="2" getProductDetails={getProductDetails} />);
    });
    expect(getProductDetails).toHaveBeenCalledTimes(2);
    expect(getProductDetails).toHaveBeenNthCalledWith(1, '1', expect.anything());
    expect(getProductDetails).toHaveBeenNthCalledWith(2, '2', expect.anything());

    // The stale id "1" response arrives after id "2"'s request started.
    await act(async () => {
      resolveFirst(productFor('1'));
    });
    expect(textOf(renderer)).toBe('loading');

    // id "2"'s response arrives and should be the one actually shown.
    await act(async () => {
      resolveSecond(productFor('2'));
    });
    expect(textOf(renderer)).toBe('Product 2');
  });

  it('retries after an error', async () => {
    const getProductDetails = jest
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(productFor('1'));

    function RetryHarness() {
      const { state, retry } = useProductDetails('1', getProductDetails);
      const label =
        state.status === 'error'
          ? state.message
          : state.status === 'success'
            ? state.data.title
            : state.status;
      return <Text onPress={retry}>{label}</Text>;
    }

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<RetryHarness />);
    });
    await act(async () => {});
    expect(textOf(renderer)).toBe('boom');

    await act(async () => {
      renderer.root.findByType(Text).props.onPress();
    });
    await act(async () => {});
    expect(textOf(renderer)).toBe('Product 1');
    expect(getProductDetails).toHaveBeenCalledTimes(2);
  });
});
