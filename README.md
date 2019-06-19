# typesmith

Inspired by [typescript-is](https://www.npmjs.com/package/typescript-is).

Transforms typescript interfaces and type into runtime validation functions. It leverages these fine libraries:

- [x] [ts-json-schema-generator](https://www.npmjs.com/package/ts-json-schema-generator) - Generate JSON Schema from Typescript AST
- [x] [ajv](https://www.npmjs.com/package/ajv) - Validates an object against JSON Schema
- [ ] [ajv-pack](https://www.npmjs.com/package/ajv-pack) - Generates JS code from JSON Schema to quickly validate an objectz

## 💿 Quick Start Guide

1. Install typesmith

```bash
npm i --save typesmith
```

2. Install ttypescript

```bash
npm i --save-dev ttypescript
```

3. Edit your tsconfig.json to use the plugin

```json
{
  "compilerOptions": {
    "transform": "typesmith/transformer",
    "options": {
      "coerceTypes": false
    }
  }
}
```

4. Replace `tsc ...` commands with `ttsc ...` commands.

## ✔ Todo

- [ ] feat(assertTypeFn): allow validation options to be overridden
