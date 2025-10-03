export const PYTHON_BACKEND = 'http://localhost:5100/';

export const PING_REDIS = PYTHON_BACKEND + 'redis/ping';
export const INFER_DATA = PYTHON_BACKEND + 'redis/infer';
export const INDEX_DATA = PYTHON_BACKEND + 'redis/index';
export const GET_INDEX = PYTHON_BACKEND + 'redis/index/{name}';
export const SEARCH_JSON = PYTHON_BACKEND + 'redis/search';

export const JSON_HEADERS = {
	'Content-Type': 'application/json',
	'Accept': 'applications/json'
};


/**
 * Replaces `{placeholder}` with its value from params.
 * @param template String with placeholders like "Hello, {name}!"
 * @param params Object holding key-value pairs for substitution.
 */
export function substitute(template: string, params: { [key: string]: string | number }): string {
	return template.replace(/{(\w+)}/g, (_, key) =>
		params.hasOwnProperty(key) ? String(params[key]) : `{${key}}`
	);
}
