import { getProperties } from '../services/propertyService';

function mockFetchOnce(
  response: Partial<Response> & { json?: () => Promise<unknown> },
) {
  (globalThis.fetch as jest.Mock).mockResolvedValueOnce(response as Response);
}

describe('getProperties', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn();
  });

  it('maps a successful response into Property[]', async () => {
    mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => [
        { userId: 1, id: 1, title: 'First post', body: 'body' },
        { userId: 1, id: 2, title: 'Second post', body: 'body' },
      ],
    });

    const properties = await getProperties();

    expect(properties).toHaveLength(2);
    expect(properties[0]).toMatchObject({ id: '1', title: 'First post' });
    expect(properties[1]).toMatchObject({ id: '2', title: 'Second post' });
    for (const property of properties) {
      expect(typeof property.location).toBe('string');
      expect(property.bedrooms).toBeGreaterThanOrEqual(1);
      expect(property.bedrooms).toBeLessThanOrEqual(5);
      expect(property.price).toBeGreaterThan(0);
      expect(property.imageUrl).toContain(property.id);
    }
  });

  it('produces the same mapping for the same input (deterministic)', async () => {
    const rawPosts = [{ userId: 1, id: 7, title: 'Stable post', body: 'b' }];
    mockFetchOnce({ ok: true, status: 200, json: async () => rawPosts });
    mockFetchOnce({ ok: true, status: 200, json: async () => rawPosts });

    const first = await getProperties();
    const second = await getProperties();

    expect(first).toEqual(second);
  });

  it('throws when the HTTP response is not ok', async () => {
    mockFetchOnce({ ok: false, status: 500, json: async () => [] });

    await expect(getProperties()).rejects.toThrow(/500/);
  });

  it('throws on a malformed (non-array) response body', async () => {
    mockFetchOnce({ ok: true, status: 200, json: async () => ({ not: 'an array' }) });

    await expect(getProperties()).rejects.toThrow(/unexpected response format/i);
  });

  it('throws when none of the returned items are valid posts', async () => {
    mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => [{ foo: 'bar' }, { id: 'not-a-number' }],
    });

    await expect(getProperties()).rejects.toThrow(/did not contain any valid/i);
  });

  it('wraps a network failure in a user-facing error', async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(getProperties()).rejects.toThrow(/could not reach the server/i);
  });

  it('preserves cancellation errors instead of wrapping them', async () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    (globalThis.fetch as jest.Mock).mockRejectedValueOnce(abortError);

    await expect(getProperties()).rejects.toBe(abortError);
  });
});
