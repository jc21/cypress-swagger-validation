import * as Parser from 'json-schema-ref-parser';
import * as JsonPath from 'jsonpath';
import * as Models from './models';

export function SwaggerValidation(config: object) {
    let swaggerSchema: any;

    const getSwaggerSchema = async (configuration: Models.IConfig, file: string | null): Promise<string | null> => {
        if (!swaggerSchema) {
            if (typeof configuration.env !== 'undefined' && typeof configuration.env.swaggerFile !== 'undefined') {
                file = configuration.env.swaggerFile;
            }
            if (!file) {
                throw new Error('Swagger file was not specified (swaggerFile)');
            } else {
                swaggerSchema = await Parser.dereference(file);
            }
        }
        return swaggerSchema;
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
            try {
                const Ajv = require('ajv')({
                    allErrors: true,
                    format: 'full',
                    nullable: true,
                    verbose: true,
                });

                const valid = Ajv.validate(endpoint, options.responseSchema);
                if (valid && !Ajv.errors) {
                    return null;
                } else {
                    if (verbose) {
                        console.log('validateSwaggerSchema:', Ajv.errors);
                        console.log('validateSwaggerSchema responseSchema:', options.responseSchema);
                        console.log('validateSwaggerSchema endpoint:', options.endpoint);
                    }
                    return new Error(Ajv.errorsText());
                }
            } catch (e) {
                if (verbose) {
                    console.error('validateSwaggerSchema Error: ', e);
                }
                return e;
            }
        }
    };
}
