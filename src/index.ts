import $RefParser from "@apidevtools/json-schema-ref-parser";
import * as SwaggerParser from '@apidevtools/swagger-parser';
import Ajv, { ErrorObject } from "ajv";
import axios from 'axios';
import * as JsonPath from 'jsonpath';
import Logger from './logger';
import * as Models from './models';

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

		defaultLog.success('Using Swagger File:', file);

		if (file && typeof swaggerSchema[file] === 'undefined' || !swaggerSchema[file]) {
			if (file.toLowerCase().startsWith('http')) {
				// Fun fact: json-schema-ref-parser doesn't work with proxies, at least
				// it's not documented as to how to make it work with proxies.
				// So instead, we're going to fetch the file ourselves and dereference it
				// afterwards.
				const response = await axios.get(file);
				swaggerSchema[file] = await $RefParser.dereference(response.data);
			} else {
				swaggerSchema[file] = await $RefParser.dereference(file);
			}
		}
		return swaggerSchema[file];
	};

	return {
		/**
		 * @param   {object}        options
		 * @param   {string}        options.endpoint
		 * @param   {string}        options.method
		 * @param   {number}        options.statusCode
		 * @param   {object}        options.responseSchema
		 * @param   {boolean}       [options.verbose]
		 * @param   {string}        [options.file]
		 * @returns {string|null}   Errors or null if OK
		 */
		validateSwaggerSchema: async (options: Models.IOptions): Promise<ErrorObject<string, Record<string, any>, unknown>[] | null | Error | undefined> => {
			const log = new Logger('validateSwaggerSchema');
			let err = '';
			if (!options.endpoint) {
				err = 'Endpoint was not specified (endpoint)';
				log.error(err);
				return new Error(err);
			}
			if (!options.method) {
				err = 'Method was not specified (method)';
				log.error(err);
				return new Error(err);
			}
			if (!options.statusCode) {
				err = 'Status Code was not specified (statusCode)';
				log.error(err);
				return new Error(err);
			}
			if (!options.responseSchema) {
				err = 'Response Schema was not specified (responseSchema)';
				log.error(err);
				return new Error(err);
			}

			const verbose = options.verbose || false;
			const schema  = await getSwaggerSchema(config, options.file || null);
			const ref     = '$.paths[\'' + options.endpoint + '\'].' + options.method + '.responses[\'' + options.statusCode + '\'].content[\'application/json\'].schema';
			let endpoint  = JsonPath.query(schema, ref);

			if (!endpoint || !endpoint.length) {
				err = 'Could not find Swagger Schema with: ' + ref;
				log.error(err);
				return new Error(err);
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
				log.debug('Endpoint:', options.method.toUpperCase(), options.endpoint);
				log.debug('Response Data:', JSON.stringify(options.responseSchema, null, 2));
			}

			const validate = ajv.compile(endpoint)
			if (validate(options.responseSchema)) {
				if (verbose) {
					log.success('Validation Success');
				}
				return null;
			} else {
				log.error('Validation Errors:', JSON.stringify(validate.errors, null, 2));
				if (verbose) {
					log.debug('Validation Schema was:', JSON.stringify(endpoint, null, 2));
				}
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
