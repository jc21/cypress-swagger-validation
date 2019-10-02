import {SwaggerValidation} from './index';

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
    });

    expect(typeof result).toBe('object');
    expect(result ? result.message : null).toBe('data.result should have required property \'commit\'');
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
    });

    expect(typeof result).toBe('object');
    expect(result ? result.message : null).toBe('data.result should NOT have additional properties');
});
