module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1758427412192, function(require, module, exports) {

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSchema = void 0;
__exportStar(require("./middlewares/exact"), exports);
__exportStar(require("./middlewares/one-of"), exports);
__exportStar(require("./middlewares/validation-chain-builders"), exports);
var schema_1 = require("./middlewares/schema");
Object.defineProperty(exports, "checkSchema", { enumerable: true, get: function () { return schema_1.checkSchema; } });
__exportStar(require("./matched-data"), exports);
__exportStar(require("./validation-result"), exports);
__exportStar(require("./express-validator"), exports);

}, function(modId) {var map = {"./middlewares/one-of":1758427412194,"./middlewares/validation-chain-builders":1758427412209,"./middlewares/schema":1758427412211,"./matched-data":1758427412212,"./validation-result":1758427412214}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1758427412194, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.oneOf = oneOf;
const _ = require("lodash");
const chain_1 = require("../chain");
const context_builder_1 = require("../context-builder");
const utils_1 = require("../utils");
// A dummy context item that gets added to surrogate contexts just to make them run
const dummyItem = { async run() { } };
/**
 * Creates a middleware that will ensure that at least one of the given validation chains
 * or validation chain groups are valid.
 *
 * If none are, a single `AlternativeValidationError` or `GroupedAlternativeValidationError`
 * is added to the request, with the errors of each chain made available under the `nestedErrors` property.
 *
 * @param chains an array of validation chains to check if are valid.
 *               If any of the items of `chains` is an array of validation chains, then all of them
 *               must be valid together for the request to be considered valid.
 */
function oneOf(chains, options = {}) {
    const run = async (req, opts) => {
        const surrogateContext = new context_builder_1.ContextBuilder().addItem(dummyItem).build();
        // Run each group of chains in parallel
        const promises = chains.map(async (chain) => {
            const group = Array.isArray(chain) ? chain : [chain];
            const results = await (0, utils_1.runAllChains)(req, group, { dryRun: true });
            const { contexts, groupErrors } = results.reduce(({ contexts, groupErrors }, result) => {
                const { context } = result;
                contexts.push(context);
                const fieldErrors = context.errors.filter((error) => error.type === 'field');
                groupErrors.push(...fieldErrors);
                return { contexts, groupErrors };
            }, {
                contexts: [],
                groupErrors: [],
            });
            // #536: The data from a chain within oneOf() can only be made available to e.g. matchedData()
            // if its entire group is valid.
            if (!groupErrors.length) {
                contexts.forEach(context => {
                    surrogateContext.addFieldInstances(context.getData());
                });
            }
            return groupErrors;
        });
        const allErrors = await Promise.all(promises);
        const success = allErrors.some(groupErrors => groupErrors.length === 0);
        if (!success) {
            const message = options.message || 'Invalid value(s)';
            switch (options.errorType) {
                case 'flat':
                    surrogateContext.addError({
                        type: 'alternative',
                        req,
                        message,
                        nestedErrors: _.flatMap(allErrors),
                    });
                    break;
                case 'least_errored':
                    let leastErroredIndex = 0;
                    for (let i = 1; i < allErrors.length; i++) {
                        if (allErrors[i].length < allErrors[leastErroredIndex].length) {
                            leastErroredIndex = i;
                        }
                    }
                    surrogateContext.addError({
                        type: 'alternative',
                        req,
                        message,
                        nestedErrors: allErrors[leastErroredIndex],
                    });
                    break;
                case 'grouped':
                default:
                    // grouped
                    surrogateContext.addError({
                        type: 'alternative_grouped',
                        req,
                        message,
                        nestedErrors: allErrors,
                    });
                    break;
            }
        }
        // Final context running pass to ensure contexts are added and values are modified properly
        return await new chain_1.ContextRunnerImpl(surrogateContext).run(req, opts);
    };
    const middleware = (req, _res, next) => run(req).then(() => next(), next);
    return Object.assign(middleware, { run });
}

}, function(modId) { var map = {"../chain":1758427412195,"../context-builder":1758427412207,"../utils":1758427412199}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1758427412195, function(require, module, exports) {

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./sanitizers"), exports);
__exportStar(require("./sanitizers-impl"), exports);
__exportStar(require("./context-handler"), exports);
__exportStar(require("./context-handler-impl"), exports);
__exportStar(require("./context-runner"), exports);
__exportStar(require("./context-runner-impl"), exports);
__exportStar(require("./validators"), exports);
__exportStar(require("./validators-impl"), exports);
__exportStar(require("./validation-chain"), exports);

}, function(modId) { var map = {"./sanitizers":1758427412196,"./sanitizers-impl":1758427412197,"./context-handler":1758427412200,"./context-runner":1758427412202,"./validators":1758427412204,"./validation-chain":1758427412206}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1758427412196, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1758427412197, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.SanitizersImpl = void 0;
const _ = require("lodash");
const validator = require("validator");
const sanitization_1 = require("../context-items/sanitization");
class SanitizersImpl {
    constructor(builder, chain) {
        this.builder = builder;
        this.chain = chain;
    }
    // custom sanitizers
    customSanitizer(sanitizer) {
        this.builder.addItem(new sanitization_1.Sanitization(sanitizer, true));
        return this.chain;
    }
    default(default_value) {
        return this.customSanitizer(value => [undefined, null, NaN, ''].includes(value) ? _.cloneDeep(default_value) : value);
    }
    replace(values_to_replace, new_value) {
        if (!Array.isArray(values_to_replace)) {
            values_to_replace = [values_to_replace];
        }
        return this.customSanitizer(value => values_to_replace.includes(value) ? _.cloneDeep(new_value) : value);
    }
    // Standard sanitizers
    addStandardSanitization(sanitizer, ...options) {
        this.builder.addItem(new sanitization_1.Sanitization(sanitizer, false, options));
        return this.chain;
    }
    blacklist(chars) {
        return this.addStandardSanitization(validator.blacklist, chars);
    }
    escape() {
        return this.addStandardSanitization(validator.escape);
    }
    unescape() {
        return this.addStandardSanitization(validator.unescape);
    }
    ltrim(chars) {
        return this.addStandardSanitization(validator.ltrim, chars);
    }
    normalizeEmail(options) {
        return this.addStandardSanitization(validator.normalizeEmail, options);
    }
    rtrim(chars) {
        return this.addStandardSanitization(validator.rtrim, chars);
    }
    stripLow(keep_new_lines) {
        return this.addStandardSanitization(validator.stripLow, keep_new_lines);
    }
    toArray() {
        return this.customSanitizer(value => (value !== undefined && ((Array.isArray(value) && value) || [value])) || []);
    }
    toBoolean(strict) {
        return this.addStandardSanitization(validator.toBoolean, strict);
    }
    toDate() {
        return this.addStandardSanitization(validator.toDate);
    }
    toFloat() {
        return this.addStandardSanitization(validator.toFloat);
    }
    toInt(radix) {
        return this.addStandardSanitization(validator.toInt, radix);
    }
    toLowerCase() {
        return this.customSanitizer(value => (typeof value === 'string' ? value.toLowerCase() : value));
    }
    toUpperCase() {
        return this.customSanitizer(value => (typeof value === 'string' ? value.toUpperCase() : value));
    }
    trim(chars) {
        return this.addStandardSanitization(validator.trim, chars);
    }
    whitelist(chars) {
        return this.addStandardSanitization(validator.whitelist, chars);
    }
}
exports.SanitizersImpl = SanitizersImpl;

}, function(modId) { var map = {"../context-items/sanitization":1758427412198}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1758427412198, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.Sanitization = void 0;
const utils_1 = require("../utils");
class Sanitization {
    constructor(sanitizer, custom, options = [], 
    // For testing only.
    // Deliberately not calling it `toString` in order to not override `Object.prototype.toString`.
    stringify = utils_1.toString) {
        this.sanitizer = sanitizer;
        this.custom = custom;
        this.options = options;
        this.stringify = stringify;
    }
    async run(context, value, meta) {
        const { path, location } = meta;
        const runCustomSanitizer = async () => {
            const sanitizerValue = this.sanitizer(value, meta);
            return Promise.resolve(sanitizerValue);
        };
        if (this.custom) {
            const newValue = await runCustomSanitizer();
            context.setData(path, newValue, location);
            return;
        }
        const values = Array.isArray(value) ? value : [value];
        const newValues = values.map(value => {
            return this.sanitizer(this.stringify(value), ...this.options);
        });
        // We get only the first value of the array if the orginal value was wrapped.
        context.setData(path, values !== value ? newValues[0] : newValues, location);
    }
}
exports.Sanitization = Sanitization;

}, function(modId) { var map = {"../utils":1758427412199}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1758427412199, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.bindAll = void 0;
exports.toString = toString;
exports.runAllChains = runAllChains;
const bindAll = (object) => {
    const protoKeys = Object.getOwnPropertyNames(Object.getPrototypeOf(object));
    protoKeys.forEach(key => {
        const maybeFn = object[key];
        if (typeof maybeFn === 'function' && key !== 'constructor') {
            object[key] = maybeFn.bind(object);
        }
    });
    return object;
};
exports.bindAll = bindAll;
function toString(value) {
    if (value instanceof Date) {
        return value.toISOString();
    }
    else if (value && typeof value === 'object' && value.toString) {
        if (typeof value.toString !== 'function') {
            return Object.getPrototypeOf(value).toString.call(value);
        }
        return value.toString();
    }
    else if (value == null || (isNaN(value) && !value.length)) {
        return '';
    }
    return String(value);
}
/**
 * Runs all validation chains, and returns their results.
 *
 * If one of them has a request-level bail set, the previous chains will be awaited on so that
 * results are not skewed, which can be slow.
 * If this same chain also contains errors, no further chains are run.
 */
async function runAllChains(req, chains, runOpts) {
    const promises = [];
    for (const chain of chains) {
        const bails = chain.builder.build().bail;
        if (bails) {
            await Promise.all(promises);
        }
        const resultPromise = chain.run(req, runOpts);
        promises.push(resultPromise);
        if (bails) {
            const result = await resultPromise;
            if (!result.isEmpty()) {
                break;
            }
        }
    }
    return Promise.all(promises);
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1758427412200, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1758427412202, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1758427412204, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1758427412206, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1758427412207, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextBuilder = void 0;
const context_1 = require("./context");
class ContextBuilder {
    constructor() {
        this.stack = [];
        this.fields = [];
        this.locations = [];
        this.optional = false;
        this.requestBail = false;
        this.visibility = { type: 'visible' };
    }
    setFields(fields) {
        this.fields = fields;
        return this;
    }
    setLocations(locations) {
        this.locations = locations;
        return this;
    }
    setMessage(message) {
        this.message = message;
        return this;
    }
    addItem(...items) {
        this.stack.push(...items);
        return this;
    }
    setOptional(options) {
        this.optional = options;
        return this;
    }
    setRequestBail() {
        this.requestBail = true;
        return this;
    }
    setHidden(hidden, hiddenValue) {
        if (hidden) {
            this.visibility =
                hiddenValue !== undefined ? { type: 'redacted', value: hiddenValue } : { type: 'hidden' };
        }
        else {
            this.visibility = { type: 'visible' };
        }
        return this;
    }
    build() {
        return new context_1.Context(this.fields, this.locations, this.stack, this.optional, this.requestBail, this.visibility, this.message);
    }
}
exports.ContextBuilder = ContextBuilder;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1758427412209, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.param = exports.header = exports.cookie = exports.body = exports.check = void 0;
exports.buildCheckFunction = buildCheckFunction;
const check_1 = require("./check");
/**
 * Creates a variant of `check()` that checks the given request locations.
 *
 * @example
 *  const checkBodyAndQuery = buildCheckFunction(['body', 'query']);
 */
function buildCheckFunction(locations) {
    return (fields, message) => (0, check_1.check)(fields, locations, message);
}
/**
 * Creates a middleware/validation chain for one or more fields that may be located in
 * any of the following:
 *
 * - `req.body`
 * - `req.cookies`
 * - `req.headers`
 * - `req.params`
 * - `req.query`
 *
 * @param fields  a string or array of field names to validate/sanitize
 * @param message an error message to use when failed validations don't specify a custom message.
 *                Defaults to `Invalid Value`.
 */
exports.check = buildCheckFunction(['body', 'cookies', 'headers', 'params', 'query']);
/**
 * Same as {@link check()}, but only validates `req.body`.
 */
exports.body = buildCheckFunction(['body']);
/**
 * Same as {@link check()}, but only validates `req.cookies`.
 */
exports.cookie = buildCheckFunction(['cookies']);
/**
 * Same as {@link check()}, but only validates `req.headers`.
 */
exports.header = buildCheckFunction(['headers']);
/**
 * Same as {@link check()}, but only validates `req.params`.
 */
exports.param = buildCheckFunction(['params']);
/**
 * Same as {@link check()}, but only validates `req.query`.
 */
exports.query = buildCheckFunction(['query']);

}, function(modId) { var map = {"./check":1758427412210}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1758427412210, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.check = check;
const chain_1 = require("../chain");
const context_builder_1 = require("../context-builder");
const utils_1 = require("../utils");
function check(fields = '', locations = [], message) {
    const builder = new context_builder_1.ContextBuilder()
        .setFields(Array.isArray(fields) ? fields : [fields])
        .setLocations(locations)
        .setMessage(message);
    const runner = new chain_1.ContextRunnerImpl(builder);
    const middleware = async (req, _res, next) => {
        try {
            await runner.run(req);
            next();
        }
        catch (e) {
            next(e);
        }
    };
    return Object.assign(middleware, (0, utils_1.bindAll)(runner), (0, utils_1.bindAll)(new chain_1.SanitizersImpl(builder, middleware)), (0, utils_1.bindAll)(new chain_1.ValidatorsImpl(builder, middleware)), (0, utils_1.bindAll)(new chain_1.ContextHandlerImpl(builder, middleware)), { builder });
}

}, function(modId) { var map = {"../chain":1758427412195,"../context-builder":1758427412207,"../utils":1758427412199}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1758427412211, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSchema = void 0;
exports.createCheckSchema = createCheckSchema;
const _ = require("lodash");
const chain_1 = require("../chain");
const utils_1 = require("../utils");
const check_1 = require("./check");
const validLocations = ['body', 'cookies', 'headers', 'params', 'query'];
const protectedNames = ['errorMessage', 'in', 'optional'];
/**
 * Factory for a {@link checkSchema()} function which can have extension validators and sanitizers.
 *
 * @see {@link checkSchema()}
 */
function createCheckSchema(createChain, extraValidators = [], extraSanitizers = []) {
    /** Type guard for an object entry for a standard validator. */
    function isStandardValidator(entry) {
        return (
        // #664 - explicitly exclude properties which should be set per validator
        !['not', 'withMessage'].includes(entry[0]) &&
            (entry[0] in chain_1.ValidatorsImpl.prototype || extraValidators.includes(entry[0])) &&
            entry[1]);
    }
    /** Type guard for an object entry for a standard sanitizer. */
    function isStandardSanitizer(entry) {
        return ((entry[0] in chain_1.SanitizersImpl.prototype || extraSanitizers.includes(entry[0])) &&
            entry[1]);
    }
    /** Type guard for an object entry for a custom validator. */
    function isCustomValidator(entry) {
        return (!isStandardValidator(entry) &&
            !isStandardSanitizer(entry) &&
            typeof entry[1] === 'object' &&
            entry[1] &&
            typeof entry[1].custom === 'function');
    }
    /** Type guard for an object entry for a custom sanitizer. */
    function isCustomSanitizer(entry) {
        return (!isStandardValidator(entry) &&
            !isStandardSanitizer(entry) &&
            typeof entry[1] === 'object' &&
            entry[1] &&
            typeof entry[1].customSanitizer === 'function');
    }
    return (schema, defaultLocations = validLocations) => {
        const chains = Object.keys(schema).map(field => {
            const config = schema[field];
            const chain = createChain(field, ensureLocations(config, defaultLocations), config.errorMessage);
            // optional doesn't matter where it happens in the chain
            if (config.optional) {
                chain.optional(config.optional === true ? true : config.optional.options);
            }
            for (const entry of Object.entries(config)) {
                if (protectedNames.includes(entry[0]) || !entry[1]) {
                    continue;
                }
                if (!isStandardValidator(entry) &&
                    !isStandardSanitizer(entry) &&
                    !isCustomValidator(entry) &&
                    !isCustomSanitizer(entry)) {
                    console.warn(`express-validator: schema of "${field}" has unknown validator/sanitizer "${entry[0]}"`);
                    continue;
                }
                // For validators, stuff that must come _before_ the validator itself in the chain.
                if ((isStandardValidator(entry) || isCustomValidator(entry)) && entry[1] !== true) {
                    const [, validatorConfig] = entry;
                    validatorConfig.if && chain.if(validatorConfig.if);
                    validatorConfig.negated && chain.not();
                }
                if (isStandardValidator(entry) || isStandardSanitizer(entry)) {
                    const options = entry[1] ? (entry[1] === true ? [] : _.castArray(entry[1].options)) : [];
                    chain[entry[0]](...options);
                }
                if (isCustomValidator(entry)) {
                    chain.custom(entry[1].custom);
                }
                if (isCustomSanitizer(entry)) {
                    chain.customSanitizer(entry[1].customSanitizer);
                }
                // For validators, stuff that must come _after_ the validator itself in the chain.
                if ((isStandardValidator(entry) || isCustomValidator(entry)) && entry[1] !== true) {
                    const [, validatorConfig] = entry;
                    validatorConfig.bail &&
                        chain.bail(validatorConfig.bail === true ? {} : validatorConfig.bail);
                    validatorConfig.errorMessage && chain.withMessage(validatorConfig.errorMessage);
                }
            }
            return chain;
        });
        const run = async (req) => (0, utils_1.runAllChains)(req, chains);
        return Object.assign(chains, { run });
    };
}
/**
 * Creates an express middleware with validations for multiple fields at once in the form of
 * a schema object.
 *
 * @param schema the schema to validate.
 * @param defaultLocations
 * @returns
 */
exports.checkSchema = createCheckSchema(check_1.check);
function ensureLocations(config, defaults) {
    // .filter(Boolean) is done because in can be undefined -- which is not going away from the type
    // See https://github.com/Microsoft/TypeScript/pull/29955 for details
    const locations = Array.isArray(config.in)
        ? config.in
        : [config.in].filter(Boolean);
    const actualLocations = locations.length ? locations : defaults;
    return actualLocations.filter(location => validLocations.includes(location));
}

}, function(modId) { var map = {"../chain":1758427412195,"../utils":1758427412199,"./check":1758427412210}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1758427412212, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.matchedData = matchedData;
const _ = require("lodash");
const base_1 = require("./base");
/**
 * Extracts data validated or sanitized from the request, and builds an object with them.
 *
 * @param req the express request object
 * @param options
 * @returns an object of data that's been validated or sanitized in the passed request
 */
function matchedData(req, options = {}) {
    const internalReq = req;
    const fieldExtractor = createFieldExtractor(options.includeOptionals !== true);
    const validityFilter = createValidityFilter(options.onlyValidData);
    const locationFilter = createLocationFilter(options.locations);
    return _(internalReq[base_1.contextsKey])
        .flatMap(fieldExtractor)
        .filter(validityFilter)
        .map(field => field.instance)
        .filter(locationFilter)
        .reduce((state, instance) => _.set(state, instance.path, instance.value), {});
}
function createFieldExtractor(removeOptionals) {
    return (context) => {
        const instances = context.getData({ requiredOnly: removeOptionals });
        return instances.map((instance) => ({ instance, context }));
    };
}
function createValidityFilter(onlyValidData = true) {
    return !onlyValidData
        ? () => true
        : (field) => {
            const hasError = field.context.errors.some(error => error.type === 'field' &&
                error.location === field.instance.location &&
                error.path === field.instance.path);
            return !hasError;
        };
}
function createLocationFilter(locations = []) {
    // No locations mean all locations
    const allLocations = locations.length === 0;
    return allLocations ? () => true : (field) => locations.includes(field.location);
}

}, function(modId) { var map = {"./base":1758427412213}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1758427412213, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationHalt = exports.contextsKey = void 0;
// Not using Symbol because of #813
exports.contextsKey = 'express-validator#contexts';
class ValidationHalt extends Error {
}
exports.ValidationHalt = ValidationHalt;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1758427412214, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.Result = exports.validationResult = void 0;
const _ = require("lodash");
const base_1 = require("./base");
const utils_1 = require("./utils");
/**
 * Extracts the validation errors of an express request
 */
exports.validationResult = Object.assign(withDefaults(), { withDefaults });
/**
 * The current state of the validation errors in a request.
 */
class Result {
    constructor(formatter, errors) {
        this.formatter = formatter;
        this.errors = errors;
    }
    /**
     * Gets the validation errors as an array.
     *
     * @param options.onlyFirstError whether only the first error of each
     */
    array(options) {
        return options && options.onlyFirstError
            ? Object.values(this.mapped())
            : this.errors.map(this.formatter);
    }
    /**
     * Gets the validation errors as an object.
     * If a field has more than one error, only the first one is set in the resulting object.
     *
     * @returns an object from field name to error
     */
    mapped() {
        return this.errors.reduce((mapping, error) => {
            const key = error.type === 'field' ? error.path : `_${error.type}`;
            if (!mapping[key]) {
                mapping[key] = this.formatter(error);
            }
            return mapping;
        }, {});
    }
    /**
     * Specifies a function to format errors with.
     * @param formatter the function to use for formatting errors
     * @returns A new {@link Result} instance with the given formatter
     */
    formatWith(formatter) {
        return new Result(formatter, this.errors);
    }
    /**
     * @returns `true` if there are no errors, `false` otherwise
     */
    isEmpty() {
        return this.errors.length === 0;
    }
    /**
     * Throws an error if there are validation errors.
     */
    throw() {
        if (!this.isEmpty()) {
            throw Object.assign(new Error(), (0, utils_1.bindAll)(this));
        }
    }
}
exports.Result = Result;
/**
 * Creates a `validationResult`-like function with default options passed to every {@link Result} it
 * returns.
 */
function withDefaults(options = {}) {
    const defaults = {
        formatter: error => error,
    };
    const actualOptions = _.defaults(options, defaults);
    return (req) => {
        const contexts = req[base_1.contextsKey] || [];
        const errors = _.flatMap(contexts, 'errors');
        return new Result(actualOptions.formatter, errors);
    };
}

}, function(modId) { var map = {"./base":1758427412213,"./utils":1758427412199}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1758427412192);
})()
//miniprogram-npm-outsideDeps=["./middlewares/exact","./express-validator","lodash","./context-handler-impl","./context-runner-impl","./validators-impl","validator","./context"]
//# sourceMappingURL=index.js.map