import type { OpenGraphScraperOptions } from './types';

/**
 * performs the fetch request and formats the body for ogs
 *
 * @param {object} options - options for ogs
 * @return {object} formatted request body and response
 *
 */
export default async function requestAndResultsFormatter(options: OpenGraphScraperOptions) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout * 1000);
  let body;
  let response;
  try {
    response = await fetch(options.url, { signal: controller.signal, ...options.fetchOptions });
    if (response && response.headers && response.headers['content-type'] && !response.headers['content-type'].includes('text/')) {
      throw new Error('Page must return a header content-type with text/');
    }
    if (response && response.status && (response.status.toString().substring(0, 1) === '4' || response.status.toString().substring(0, 1) === '5')) {
      throw new Error('Server has returned a 400/500 error code');
    }

    body = await response.text();
    if (body === undefined || body === '') {
      throw new Error('Page not found');
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'fetch failed') throw error.cause;
      throw error;
    }
    throw new Error(error);
  } finally {
    clearTimeout(timeoutId);
  }

  return { body, response };
}
