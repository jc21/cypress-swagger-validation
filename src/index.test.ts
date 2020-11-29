import {SwaggerValidation} from './index';

test('test valid JSON swagger file', async () => {
    const sv = SwaggerValidation({
        env: {
            swaggerFile: './testing/swagger.json'
        }
    });

    const result = await sv.validateSwaggerFile();
    expect(result).toBe(null);
});

test('test invalid JSON swagger file', async () => {
    const sv = SwaggerValidation({
        env: {
            swaggerFile: './testing/swagger-invalid.json'
        }
    });

    const result = await sv.validateSwaggerFile();
    const resultString = JSON.stringify(result, null, 2);
    expect(resultString).toMatch(/JSON_OBJECT_VALIDATION_FAILED/i);
});

test('test JSON swagger doc', async () => {
    const sv = SwaggerValidation({
        env: {
            swaggerFile: './testing/swagger.json'
        }
    });

    const result = await sv.validateSwaggerSchema({
        endpoint: '/healthz',
        method: 'get',
        responseSchema: {
            result: {
                checks: {
                    databases: {
                        healthy: true
                    }
                },
                commit: '88cb49b8f8d4d9ce7c48',
                healthy: true
            }
        },
        statusCode: 200,
        verbose: true,
    });

    expect(result).toBe(null);
});

test('test YML swagger doc', async () => {
    const sv = SwaggerValidation({
        env: {
            swaggerFile: './testing/swagger.yml'
        }
    });

    const result = await sv.validateSwaggerSchema({
        endpoint: '/healthz',
        method: 'get',
        responseSchema: {
            result: {
                checks: {
                    databases: {
                        healthy: true
                    }
                },
                commit: '88cb49b8f8d4d9ce7c48',
                healthy: true
            }
        },
        statusCode: 200,
        verbose: true,
    });

    expect(result).toBeNull();
});

test('test JSON swagger doc Invalid', async () => {
    const sv = SwaggerValidation({
        env: {
            swaggerFile: './testing/swagger.json'
        }
    });

    const result = await sv.validateSwaggerSchema({
        endpoint: '/healthz',
        method: 'get',
        responseSchema: {
            result: {
                checks: {
                    databases: {
                        healthy: true
                    }
                },
                healthy: true
            }
        },
        statusCode: 200,
        verbose: true,
    });

    expect(typeof result).toBe('string');
    expect(result).toBe('data.result should have required property \'commit\'');
});

test('test YML swagger doc Invalid', async () => {
    const sv = SwaggerValidation({
        env: {
            swaggerFile: './testing/swagger.yml'
        }
    });

    const result = await sv.validateSwaggerSchema({
        endpoint: '/healthz',
        method: 'get',
        responseSchema: {
            result: {
                abc: 123,
                checks: {
                    databases: {
                        healthy: true
                    }
                },
                commit: '88cb49b8f8d4d9ce7c48',
                healthy: true
            }
        },
        statusCode: 200,
        verbose: true,
    });

    expect(typeof result).toBe('string');
    expect(result).toBe('data.result should NOT have additional properties');
});
