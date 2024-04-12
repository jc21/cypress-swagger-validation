# Cypress Swagger Validation Plugin

Validate your request responses against Swagger JSON Endpoints. AKA Contract Testing.

[![npm (scoped)](https://img.shields.io/npm/v/@jc21/cypress-swagger-validation.svg?style=for-the-badge)](https://www.npmjs.com/package/@jc21/cypress-swagger-validation)
[![npm (types)](https://img.shields.io/npm/types/@jc21/cypress-swagger-validation.svg?style=for-the-badge)](https://www.npmjs.com/package/@jc21/cypress-swagger-validation)
[![npm (licence)](https://img.shields.io/npm/l/@jc21/cypress-swagger-validation.svg?style=for-the-badge)](https://www.npmjs.com/package/@jc21/cypress-swagger-validation)

Do you use Cypress to perform API endpoint testing? Do you have Swagger/Openapi v3 schema?
This is the plugin for you.

See the [example swagger files](testing) to see how the usage below works with it.

Your swagger doc will need endpoints with content schema defined.


### Cypress Installation

```bash
yarn add @jc21/cypress-swagger-validation
```

Then in your cypress Plugins file:
```javascript
const {SwaggerValidation} = require('@jc21/cypress-swagger-validation');

module.exports = (on, config) => {
    // ...
    on('task', SwaggerValidation(config));
    // ...
    return config;
};
```


### Cypress Usage

```javascript
describe('Basic API checks', () => {
    it('Should be a valid swagger schema', function () {
        cy.task('validateSwaggerFile', {
            file: './testing/swagger.json',  // optional path or full URL, see below
        }).should('equal', null);
    });

    it('Should return a valid health payload', function () {
        cy.request('/healthz').then($response => {
            // Check the swagger schema:
            cy.task('validateSwaggerSchema', {
                file:           './testing/swagger.json',  // optional path or full URL, see below
                endpoint:       '/healthz',
                method:         'get',
                statusCode:     200,
                responseSchema: $response.body,
                contentType:    "application/hal+json",
                verbose:        true,                      // optional, default: false
            }).should('equal', null);
        });
    });
});
```

### The swagger file

This can either be a file on disk or a URL.

When using a file on disk and due to the fact that this plugin runs on the Cypress Backend, the location of the file must be defined as either
the full path on disk or relative path to the running of the cypress command.

You can define the swagger file location either with an environment variable which can apply to all tests:

`config.env.swaggerFile`

or within each individial test using the options below.


### Options

#### validateSwaggerFile

| Option           | Description                                                   | Optional | Default                  |
| ---------------- | ------------------------------------------------------------- | -------- | ------------------------ |
| `file`           | The location of the swagger file to use for contract testing  | true     | `config.env.swaggerFile` |

#### validateSwaggerSchema

| Option           | Description                                                   | Optional | Default                  |
| ---------------- | ------------------------------------------------------------- | -------- | ------------------------ |
| `file`           | The location of the swagger file to use for contract testing  | true     | `config.env.swaggerFile` |
| `endpoint`       | The name of the swagger endpoint to check                     |          |                          |
| `method`         | The request method of the endpoint                            |          |                          |
| `statuscode`     | The http status code beneath the method                       |          |                          |
| `contentType`    | The http status code beneath the method                       |          |                          |
| `responseSchema` | The payload of the API response to validate                   | true     | `application/json`       |
| `verbose`        | Console.log more info when validation fails                   | true     | false                    |


### Compiling Source

```bash
yarn install
yarn build
yarn test
```
