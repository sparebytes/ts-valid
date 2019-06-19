import * as Ajv from "ajv";
import { ErrorObject } from "./ajv-errors";
import NestedError = require("nested-error-stacks");
import ajv = require("ajv");

export interface AssertTypeOptions {
  /**
   * remove additional properties - see example in Filtering data. This option is not used if schema is added with addMetaSchema method.
   * Option values:
   * - false (default) - not to remove additional properties
   * - "all" - all additional properties are removed, regardless of additionalProperties keyword in schema (and no validation is made for them).
   * - true - only additional properties with additionalProperties keyword equal to false are removed.
   * - "failing" - additional properties that fail schema validation will be removed (where additionalProperties keyword is false or schema).
   */
  removeAdditional: boolean | "all" | "failing";

  /**
   * replace missing or undefined properties and items with the values from corresponding default keywords. Default behaviour is to ignore default keywords. This option is not used if schema is added with addMetaSchema method. See examples in Assigning defaults.
   * Option values:
   * - false (default) - do not use defaults
   * - true - insert defaults by value (object literal is used).
   * - "empty" - in addition to missing or undefined, use defaults for properties and items that are equal to null or "" (an empty string).
   * - "shared" (deprecated) - insert defaults by reference. If the default is an object, it will be shared by all instances of validated data. If you modify the inserted default in the validated data, it will be modified in the schema as well.
   */
  useDefaults: boolean | "empty" | "shared";

  /**
   * change data type of data to match type keyword. See the example in Coercing data types and coercion rules.
   * Option values:
   * - false (default) - no type coercion.
   * - true - coerce scalar data types.
   * - "array" - in addition to coercions between scalar types, coerce scalar data to an array with one element and vice versa (as required by the schema).
   */
  coerceTypes: boolean | "array";

  /**
   * should the validation function be compiled lazily
   * Option values:
   * - false - compile the validation function ASAP
   * - true (default) - compile the validation function the first time it is used
   */
  lazyCompile: boolean;
}

export class AssertTypeSuccess<T> {
  readonly tag: "success" = "success";
  readonly isSuccess = true;
  constructor(private value: T) {}
  unwrap(): T {
    return this.value;
  }
  map<U>(mapFn: (v: T) => U): AssertTypeSuccess<U> {
    return new AssertTypeSuccess(mapFn(this.value));
  }
  getErrors(): null {
    return null;
  }
  getOrElse(orElseValue: T): T {
    return this.value;
  }
  getOrElseL(orElseFn: (errors: ErrorObject[]) => T): T {
    return this.value;
  }
}

export class AssertTypeFailure<T> {
  readonly tag: "failure" = "failure";
  readonly isSuccess = false;
  constructor(private errors: ErrorObject[]) {}
  unwrap(): never {
    throw new NestedError("Validation Error", this.errors as any);
  }
  map<U>(mapFn: (v: T) => U): AssertTypeSuccess<U> {
    return (this as unknown) as AssertTypeSuccess<U>;
  }
  getErrors() {
    return this.errors;
  }
  getOrElse(orElseValue: T): T {
    return orElseValue;
  }
  getOrElseL(orElseFn: (errors: ErrorObject[]) => T): T {
    return orElseFn(this.errors);
  }
}

export type AssertTypeResult<T> = AssertTypeSuccess<T> | AssertTypeFailure<T>;

export type AssertTypeFn<T> = (object: any) => AssertTypeResult<T>;

export function assertTypeFnFactory<T>(options: Partial<AssertTypeOptions>, jsonSchema: any): AssertTypeFn<T> {
  const ajv = new Ajv(options as any);
  let typeValidateFn: ajv.ValidateFunction;

  if (options.lazyCompile === false) {
    typeValidateFn = ajv.compile(jsonSchema);
  } else {
    typeValidateFn = (...args: any[]) => {
      typeValidateFn = ajv.compile(jsonSchema);
      return typeValidateFn.apply(null, args as any);
    };
    typeValidateFn.schema = jsonSchema;
  }

  return object => {
    const isValid = typeValidateFn(object);
    return isValid ? new AssertTypeSuccess<T>(object) : new AssertTypeFailure<T>(typeValidateFn.errors as Ajv.ErrorObject[]);
  };
}
