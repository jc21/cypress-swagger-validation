import * as SwaggerParser from '@apidevtools/swagger-parser';
import * as Parser from 'json-schema-ref-parser';
import * as JsonPath from 'jsonpath';
import Logger from './logger';
import * as Models from './models';
import Ajv, {ErrorObject} from "ajv"

const defaultLog = new Logger('cypress-swagger-validation');

export function SwaggerValidation(config: object) {
	const swaggerSchema: any = [];
	defaultLog.success('Plugin Loaded');

	const getSwaggerSchema = async (configuration: Models.IConfig, file: string | null): Promise<string | null> => {
		if (!file && typeof configuration.env !== 'undefined' && typeof configuration.env.swaggerFile !== 'undefined') {
			file = configuration.env.swaggerFile;
		} else if (!file) {
			throw new Error('Swagger file was not specified (swaggerFile)');
		}

		if (file && typeof swaggerSchema[file] === 'undefined' || !swaggerSchema[file]) {
			swaggerSchema[file] = await Parser.dereference(file);
		}
		return swaggerSchema[file];
	};

	return {
		/**
		 * @param   {object}        options
		 * @param   {string}        options.endpoint
		 * @param   {string}        options.method
		 * @param   {number}        options.statusCode
		 * @param   {string}        options.contentType
		 * @param   {object}        options.responseSchema
		 * @param   {boolean}       [options.verbose]
		 * @param   {string}        [options.file]
		 * @returns {string|null}   Errors or null if OK
		 */
		validateSwaggerSchema: async (options: Models.IOptions): Promise<ErrorObject<string, Record<string, any>, unknown>[] | null | Error | undefined> => {
			const log = new Logger('validateSwaggerSchema');
			if (!options.endpoint) {
				return new Error('Endpoint was not specified (endpoint)');
			}
			if (!options.method) {
				return new Error('Method was not specified (method)');
			}
			if (!options.statusCode) {
				return new Error('Status Code was not specified (statusCode)');
			}
			if (!options.responseSchema) {
				return new Error('Response Schema was not specified (responseSchema)');
			}

			const verbose = options.verbose || false;
			const schema  = await getSwaggerSchema(config, options.file || null);
			const contentType = options.contentType || "application/json";
            const ref = '$.paths[\'' + options.endpoint + '\'].' + options.method + '.responses.' + options.statusCode + '.content[\''+contentType+'\'].schema';
			let endpoint  = JsonPath.query(schema, ref);

			if (!endpoint || !endpoint.length) {
				return new Error('Could not find Swagger Schema with: ' + ref);
			}

			// The endpoint var should be an array of found items with only 1 item ideally.
			endpoint = endpoint.shift();

			// Now validate the endpoint schema against the response
			// See: https://ajv.js.org/options.html
			const ajv = new Ajv({
				allErrors: true,
				verbose: true,
				strictSchema: false,
			})

			if (verbose) {
				log.debug('Endpoint:', options.endpoint);
				log.debug('Response Schema:', JSON.stringify(options.responseSchema, null, 2));
			}

			const validate = ajv.compile(endpoint)
			if (validate(options.responseSchema)) {
				if (verbose) {
					log.success('Validation Success');
				}
				return null;
			} else {
				log.error(JSON.stringify(validate.errors, null, 2));
				return validate.errors;
			}
		},

		/**
		 * @param   {object}        options
		 * @param   {string}        [options.file]
		 * @returns {string|null}   Errors or null if OK
		 */
		validateSwaggerFile: async (options?: Models.IOptions): Promise<Error | null> => {
			const log = new Logger('validateSwaggerFile');
			const schema  = await getSwaggerSchema(config, options?.file || null);

			try {
				let api = await SwaggerParser.validate(schema || "");
				log.info("API name: %s, Version: %s", api.info.title, api.info.version);
				return null;
			} catch(err: any) {
				return err;
			}
		}
	};
}
