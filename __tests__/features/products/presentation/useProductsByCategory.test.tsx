import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import { useProductsByCategory } from '../../../../src/features/products/presentation/hooks/useProductsByCategory';
import { GetProductsByCategory } from '../../../../src/features/products/domain/usecases/GetProductsByCategory';
import { Product } from '../../../../src/features/products/domain/models/Product';
import { ProductsPage } from '../../../../src/features/products/domain/models/ProductsPage';

function productFor(id: string, title: string): Product {
  return {
    id,
    title,
    description: 'desc',
    price: 1,
    category: 'misc',
    rating: 1,
    imageUrl: 'https://example.com/img.png',
  };
}

function page(products: Product[], total: number): ProductsPage {
  return { products, total };
}

function HookHarness({
  categorySlug,
  getProductsByCategory,
}: {
  categorySlug: string;
  getProductsByCategory: GetProductsByCategory;
}) {
  const { state, loadMore, isLoadingMore, loadMoreError, hasMore } = useProductsByCategory(
    categorySlug,
    getProductsByCategory,
  );
  const stateLabel =
    state.status === 'success' ? state.data.map(product => product.title).join(',') : state.status;
  const footerLabel = isLoadingMore ? 'loading-more' : loadMoreError ?? (hasMore ? 'has-more' : 'no-more');

  return (
    <>
      <Text testID="state">{stateLabel}</Text>
      <Text testID="footer">{footerLabel}</Text>
      <Text testID="loadMore" onPress={loadMore} />
    </>
  );
}

function textOf(renderer: ReactTestRenderer.ReactTestRenderer, testID: string): string {
  return renderer.root.findByProps({ testID }).props.children;
}

function pressLoadMore(renderer: ReactTestRenderer.ReactTestRenderer) {
  (renderer.root.findByProps({ testID: 'loadMore' }).props as { onPress: () => void }).onPress();
}

describe('useProductsByCategory', () => {
  it('fetches the first page with limit=10, skip=0 for the given category', async () => {
    const getProductsByCategory: jest.MockedFunction<GetProductsByCategory> = jest
      .fn()
      .mockResolvedValue(page([productFor('1', 'A')], 1));

    await act(async () => {
      ReactTestRenderer.create(
        <HookHarness categorySlug="laptops" getProductsByCategory={getProductsByCategory} />,
      );
    });

    expect(getProductsByCategory).toHaveBeenCalledWith('laptops', 10, 0, expect.anything());
  });

  it('loads subsequent pages with an increasing skip and appends instead of replacing', async () => {
    const getProductsByCategory: jest.MockedFunction<GetProductsByCategory> = jest
      .fn()
      .mockResolvedValueOnce(page([productFor('1', 'A'), productFor('2', 'B')], 5))
      .mockResolvedValueOnce(page([productFor('3', 'C'), productFor('4', 'D')], 5))
      .mockResolvedValueOnce(page([productFor('5', 'E')], 5));

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <HookHarness categorySlug="laptops" getProductsByCategory={getProductsByCategory} />,
      );
    });
    expect(textOf(renderer, 'state')).toBe('A,B');

    await act(async () => {
      pressLoadMore(renderer);
    });
    expect(getProductsByCategory).toHaveBeenNthCalledWith(2, 'laptops', 10, 2, expect.anything());
    expect(textOf(renderer, 'state')).toBe('A,B,C,D');

    await act(async () => {
      pressLoadMore(renderer);
    });
    expect(getProductsByCategory).toHaveBeenNthCalledWith(3, 'laptops', 10, 4, expect.anything());
    expect(textOf(renderer, 'state')).toBe('A,B,C,D,E');

    // Every product has now been loaded (5 of 5) — a further call must not
    // issue another request.
    expect(textOf(renderer, 'footer')).toBe('no-more');
    await act(async () => {
      pressLoadMore(renderer);
    });
    expect(getProductsByCategory).toHaveBeenCalledTimes(3);
  });

  it('does not issue a second request when loadMore is called again before the first resolves', async () => {
    let resolveSecondPage!: (value: ProductsPage) => void;
    const getProductsByCategory: jest.MockedFunction<GetProductsByCategory> = jest
      .fn()
      .mockResolvedValueOnce(page([productFor('1', 'A')], 3))
      .mockImplementationOnce(() => new Promise(resolve => (resolveSecondPage = resolve)));

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <HookHarness categorySlug="laptops" getProductsByCategory={getProductsByCategory} />,
      );
    });

    await act(async () => {
      pressLoadMore(renderer);
      pressLoadMore(renderer);
      pressLoadMore(renderer);
    });

    expect(getProductsByCategory).toHaveBeenCalledTimes(2);
    expect(textOf(renderer, 'footer')).toBe('loading-more');

    await act(async () => {
      resolveSecondPage(page([productFor('2', 'B')], 3));
    });
    expect(getProductsByCategory).toHaveBeenCalledTimes(2);
    expect(textOf(renderer, 'state')).toBe('A,B');
  });

  it('keeps the loaded products and the same offset after a failed loadMore, and lets it be retried', async () => {
    const getProductsByCategory: jest.MockedFunction<GetProductsByCategory> = jest
      .fn()
      .mockResolvedValueOnce(page([productFor('1', 'A')], 2))
      .mockRejectedValueOnce(new Error('load more boom'))
      .mockResolvedValueOnce(page([productFor('2', 'B')], 2));

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <HookHarness categorySlug="laptops" getProductsByCategory={getProductsByCategory} />,
      );
    });

    await act(async () => {
      pressLoadMore(renderer);
    });
    expect(textOf(renderer, 'state')).toBe('A');
    expect(textOf(renderer, 'footer')).toBe('load more boom');

    await act(async () => {
      pressLoadMore(renderer);
    });
    expect(getProductsByCategory).toHaveBeenNthCalledWith(3, 'laptops', 10, 1, expect.anything());
    expect(textOf(renderer, 'state')).toBe('A,B');
  });

  it('resets pagination and replaces the list when the category changes, ignoring a stale response from the previous category', async () => {
    let resolveLaptops!: (value: ProductsPage) => void;
    let capturedLaptopsSignal: AbortSignal | undefined;
    const getProductsByCategory: jest.MockedFunction<GetProductsByCategory> = jest
      .fn()
      .mockImplementationOnce((_category, _limit, _skip, signal) => {
        capturedLaptopsSignal = signal;
        return new Promise(resolve => (resolveLaptops = resolve));
      })
      .mockResolvedValueOnce(page([productFor('9', 'Fragrance A')], 1));

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <HookHarness categorySlug="laptops" getProductsByCategory={getProductsByCategory} />,
      );
    });
    expect(textOf(renderer, 'state')).toBe('loading');

    // Switch categories while the "laptops" request is still pending.
    await act(async () => {
      renderer.update(
        <HookHarness categorySlug="fragrances" getProductsByCategory={getProductsByCategory} />,
      );
    });

    expect(getProductsByCategory).toHaveBeenNthCalledWith(2, 'fragrances', 10, 0, expect.anything());
    expect(capturedLaptopsSignal?.aborted).toBe(true);

    // The stale "laptops" response arrives after the switch — it must not
    // overwrite the new category's state.
    await act(async () => {
      resolveLaptops(page([productFor('1', 'Laptop A')], 1));
    });

    expect(textOf(renderer, 'state')).toBe('Fragrance A');
  });
});
