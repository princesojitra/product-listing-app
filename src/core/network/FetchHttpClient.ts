import { HttpClient } from './HttpClient';

/** Production `HttpClient`, backed by the platform's global `fetch`. */
export const fetchHttpClient: HttpClient = { fetch };
