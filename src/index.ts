import * as Parser from 'json-schema-ref-parser';
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
         * @param   {object}        options.responseSchema
         * @param   {boolean}       options.verbose
         * @returns {string|null}   Errors or null if OK
         */
        validateSwaggerSchema: async (options: Models.IOptions): Promise<Error | null> => {
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
            const ref     = '$.paths[\'' + options.endpoint + '\'].' + options.method + '.responses.' + options.statusCode + '.content[\'application/json\'].schema';
            let endpoint  = JsonPath.query(schema, ref);

            if (!endpoint || !endpoint.length) {
                return new Error('Could not find Swagger Schema with: ' + ref);
            }

            // The endpoint var should be an array of found items with only 1 item ideally.
            endpoint = endpoint.shift();

            // Now validate the endpoint schema against the response
            const Ajv = require('ajv')({
                allErrors: true,
                format: 'full',
                nullable: true,
                verbose: true,
            });

            if (verbose) {
                log.debug('Endpoint:', options.endpoint);
                log.debug('Response Schema:', options.responseSchema);
            }

            const valid = Ajv.validate(endpoint, options.responseSchema);
            if (valid && !Ajv.errors) {
                if (verbose) {
                    log.success('Validation Success');
                }
                return null;
            } else {
                log.error(Ajv.errorsText());
                return Ajv.errorsText();
            }
        }
    };
}
