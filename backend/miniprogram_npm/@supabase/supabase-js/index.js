module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1758427411936, function(require, module, exports) {

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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = exports.SupabaseClient = exports.FunctionRegion = exports.FunctionsError = exports.FunctionsRelayError = exports.FunctionsFetchError = exports.FunctionsHttpError = exports.PostgrestError = void 0;
const SupabaseClient_1 = __importDefault(require("./SupabaseClient"));
__exportStar(require("@supabase/auth-js"), exports);
var postgrest_js_1 = require("@supabase/postgrest-js");
Object.defineProperty(exports, "PostgrestError", { enumerable: true, get: function () { return postgrest_js_1.PostgrestError; } });
var functions_js_1 = require("@supabase/functions-js");
Object.defineProperty(exports, "FunctionsHttpError", { enumerable: true, get: function () { return functions_js_1.FunctionsHttpError; } });
Object.defineProperty(exports, "FunctionsFetchError", { enumerable: true, get: function () { return functions_js_1.FunctionsFetchError; } });
Object.defineProperty(exports, "FunctionsRelayError", { enumerable: true, get: function () { return functions_js_1.FunctionsRelayError; } });
Object.defineProperty(exports, "FunctionsError", { enumerable: true, get: function () { return functions_js_1.FunctionsError; } });
Object.defineProperty(exports, "FunctionRegion", { enumerable: true, get: function () { return functions_js_1.FunctionRegion; } });
__exportStar(require("@supabase/realtime-js"), exports);
var SupabaseClient_2 = require("./SupabaseClient");
Object.defineProperty(exports, "SupabaseClient", { enumerable: true, get: function () { return __importDefault(SupabaseClient_2).default; } });
/**
 * Creates a new Supabase Client.
 */
const createClient = (supabaseUrl, supabaseKey, options) => {
    return new SupabaseClient_1.default(supabaseUrl, supabaseKey, options);
};
exports.createClient = createClient;
// Check for Node.js <= 18 deprecation
function shouldShowDeprecationWarning() {
    // Skip in browser environments
    if (typeof window !== 'undefined') {
        return false;
    }
    // Skip if process is not available (e.g., Edge Runtime)
    if (typeof process === 'undefined') {
        return false;
    }
    // Use dynamic property access to avoid Next.js Edge Runtime static analysis warnings
    const processVersion = process['version'];
    if (processVersion === undefined || processVersion === null) {
        return false;
    }
    const versionMatch = processVersion.match(/^v(\d+)\./);
    if (!versionMatch) {
        return false;
    }
    const majorVersion = parseInt(versionMatch[1], 10);
    return majorVersion <= 18;
}
if (shouldShowDeprecationWarning()) {
    console.warn(`⚠️  Node.js 18 and below are deprecated and will no longer be supported in future versions of @supabase/supabase-js. ` +
        `Please upgrade to Node.js 20 or later. ` +
        `For more information, visit: https://github.com/orgs/supabase/discussions/37217`);
}
//# sourceMappingURL=index.js.map
}, function(modId) {var map = {"./SupabaseClient":1758427411937}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1758427411937, function(require, module, exports) {

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions_js_1 = require("@supabase/functions-js");
const postgrest_js_1 = require("@supabase/postgrest-js");
const realtime_js_1 = require("@supabase/realtime-js");
const storage_js_1 = require("@supabase/storage-js");
const constants_1 = require("./lib/constants");
const fetch_1 = require("./lib/fetch");
const helpers_1 = require("./lib/helpers");
const SupabaseAuthClient_1 = require("./lib/SupabaseAuthClient");
/**
 * Supabase Client.
 *
 * An isomorphic Javascript client for interacting with Postgres.
 */
class SupabaseClient {
    /**
     * Create a new client for use in the browser.
     * @param supabaseUrl The unique Supabase URL which is supplied when you create a new project in your project dashboard.
     * @param supabaseKey The unique Supabase Key which is supplied when you create a new project in your project dashboard.
     * @param options.db.schema You can switch in between schemas. The schema needs to be on the list of exposed schemas inside Supabase.
     * @param options.auth.autoRefreshToken Set to "true" if you want to automatically refresh the token before expiring.
     * @param options.auth.persistSession Set to "true" if you want to automatically save the user session into local storage.
     * @param options.auth.detectSessionInUrl Set to "true" if you want to automatically detects OAuth grants in the URL and signs in the user.
     * @param options.realtime Options passed along to realtime-js constructor.
     * @param options.storage Options passed along to the storage-js constructor.
     * @param options.global.fetch A custom fetch implementation.
     * @param options.global.headers Any additional headers to send with each network request.
     */
    constructor(supabaseUrl, supabaseKey, options) {
        var _a, _b, _c;
        this.supabaseUrl = supabaseUrl;
        this.supabaseKey = supabaseKey;
        const baseUrl = (0, helpers_1.validateSupabaseUrl)(supabaseUrl);
        if (!supabaseKey)
            throw new Error('supabaseKey is required.');
        this.realtimeUrl = new URL('realtime/v1', baseUrl);
        this.realtimeUrl.protocol = this.realtimeUrl.protocol.replace('http', 'ws');
        this.authUrl = new URL('auth/v1', baseUrl);
        this.storageUrl = new URL('storage/v1', baseUrl);
        this.functionsUrl = new URL('functions/v1', baseUrl);
        // default storage key uses the supabase project ref as a namespace
        const defaultStorageKey = `sb-${baseUrl.hostname.split('.')[0]}-auth-token`;
        const DEFAULTS = {
            db: constants_1.DEFAULT_DB_OPTIONS,
            realtime: constants_1.DEFAULT_REALTIME_OPTIONS,
            auth: Object.assign(Object.assign({}, constants_1.DEFAULT_AUTH_OPTIONS), { storageKey: defaultStorageKey }),
            global: constants_1.DEFAULT_GLOBAL_OPTIONS,
        };
        const settings = (0, helpers_1.applySettingDefaults)(options !== null && options !== void 0 ? options : {}, DEFAULTS);
        this.storageKey = (_a = settings.auth.storageKey) !== null && _a !== void 0 ? _a : '';
        this.headers = (_b = settings.global.headers) !== null && _b !== void 0 ? _b : {};
        if (!settings.accessToken) {
            this.auth = this._initSupabaseAuthClient((_c = settings.auth) !== null && _c !== void 0 ? _c : {}, this.headers, settings.global.fetch);
        }
        else {
            this.accessToken = settings.accessToken;
            this.auth = new Proxy({}, {
                get: (_, prop) => {
                    throw new Error(`@supabase/supabase-js: Supabase Client is configured with the accessToken option, accessing supabase.auth.${String(prop)} is not possible`);
                },
            });
        }
        this.fetch = (0, fetch_1.fetchWithAuth)(supabaseKey, this._getAccessToken.bind(this), settings.global.fetch);
        this.realtime = this._initRealtimeClient(Object.assign({ headers: this.headers, accessToken: this._getAccessToken.bind(this) }, settings.realtime));
        this.rest = new postgrest_js_1.PostgrestClient(new URL('rest/v1', baseUrl).href, {
            headers: this.headers,
            schema: settings.db.schema,
            fetch: this.fetch,
        });
        this.storage = new storage_js_1.StorageClient(this.storageUrl.href, this.headers, this.fetch, options === null || options === void 0 ? void 0 : options.storage);
        if (!settings.accessToken) {
            this._listenForAuthEvents();
        }
    }
    /**
     * Supabase Functions allows you to deploy and invoke edge functions.
     */
    get functions() {
        return new functions_js_1.FunctionsClient(this.functionsUrl.href, {
            headers: this.headers,
            customFetch: this.fetch,
        });
    }
    /**
     * Perform a query on a table or a view.
     *
     * @param relation - The table or view name to query
     */
    from(relation) {
        return this.rest.from(relation);
    }
    // NOTE: signatures must be kept in sync with PostgrestClient.schema
    /**
     * Select a schema to query or perform an function (rpc) call.
     *
     * The schema needs to be on the list of exposed schemas inside Supabase.
     *
     * @param schema - The schema to query
     */
    schema(schema) {
        return this.rest.schema(schema);
    }
    // NOTE: signatures must be kept in sync with PostgrestClient.rpc
    /**
     * Perform a function call.
     *
     * @param fn - The function name to call
     * @param args - The arguments to pass to the function call
     * @param options - Named parameters
     * @param options.head - When set to `true`, `data` will not be returned.
     * Useful if you only need the count.
     * @param options.get - When set to `true`, the function will be called with
     * read-only access mode.
     * @param options.count - Count algorithm to use to count rows returned by the
     * function. Only applicable for [set-returning
     * functions](https://www.postgresql.org/docs/current/functions-srf.html).
     *
     * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
     * hood.
     *
     * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
     * statistics under the hood.
     *
     * `"estimated"`: Uses exact count for low numbers and planned count for high
     * numbers.
     */
    rpc(fn, args = {}, options = {}) {
        return this.rest.rpc(fn, args, options);
    }
    /**
     * Creates a Realtime channel with Broadcast, Presence, and Postgres Changes.
     *
     * @param {string} name - The name of the Realtime channel.
     * @param {Object} opts - The options to pass to the Realtime channel.
     *
     */
    channel(name, opts = { config: {} }) {
        return this.realtime.channel(name, opts);
    }
    /**
     * Returns all Realtime channels.
     */
    getChannels() {
        return this.realtime.getChannels();
    }
    /**
     * Unsubscribes and removes Realtime channel from Realtime client.
     *
     * @param {RealtimeChannel} channel - The name of the Realtime channel.
     *
     */
    removeChannel(channel) {
        return this.realtime.removeChannel(channel);
    }
    /**
     * Unsubscribes and removes all Realtime channels from Realtime client.
     */
    removeAllChannels() {
        return this.realtime.removeAllChannels();
    }
    _getAccessToken() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.accessToken) {
                return yield this.accessToken();
            }
            const { data } = yield this.auth.getSession();
            return (_b = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) !== null && _b !== void 0 ? _b : this.supabaseKey;
        });
    }
    _initSupabaseAuthClient({ autoRefreshToken, persistSession, detectSessionInUrl, storage, userStorage, storageKey, flowType, lock, debug, }, headers, fetch) {
        const authHeaders = {
            Authorization: `Bearer ${this.supabaseKey}`,
            apikey: `${this.supabaseKey}`,
        };
        return new SupabaseAuthClient_1.SupabaseAuthClient({
            url: this.authUrl.href,
            headers: Object.assign(Object.assign({}, authHeaders), headers),
            storageKey: storageKey,
            autoRefreshToken,
            persistSession,
            detectSessionInUrl,
            storage,
            userStorage,
            flowType,
            lock,
            debug,
            fetch,
            // auth checks if there is a custom authorizaiton header using this flag
            // so it knows whether to return an error when getUser is called with no session
            hasCustomAuthorizationHeader: Object.keys(this.headers).some((key) => key.toLowerCase() === 'authorization'),
        });
    }
    _initRealtimeClient(options) {
        return new realtime_js_1.RealtimeClient(this.realtimeUrl.href, Object.assign(Object.assign({}, options), { params: Object.assign({ apikey: this.supabaseKey }, options === null || options === void 0 ? void 0 : options.params) }));
    }
    _listenForAuthEvents() {
        let data = this.auth.onAuthStateChange((event, session) => {
            this._handleTokenChanged(event, 'CLIENT', session === null || session === void 0 ? void 0 : session.access_token);
        });
        return data;
    }
    _handleTokenChanged(event, source, token) {
        if ((event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') &&
            this.changedAccessToken !== token) {
            this.changedAccessToken = token;
        }
        else if (event === 'SIGNED_OUT') {
            this.realtime.setAuth();
            if (source == 'STORAGE')
                this.auth.signOut();
            this.changedAccessToken = undefined;
        }
    }
}
exports.default = SupabaseClient;
//# sourceMappingURL=SupabaseClient.js.map
}, function(modId) { var map = {"./lib/constants":1758427411938,"./lib/fetch":1758427411940,"./lib/helpers":1758427411941,"./lib/SupabaseAuthClient":1758427411942}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1758427411938, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_REALTIME_OPTIONS = exports.DEFAULT_AUTH_OPTIONS = exports.DEFAULT_DB_OPTIONS = exports.DEFAULT_GLOBAL_OPTIONS = exports.DEFAULT_HEADERS = void 0;
const version_1 = require("./version");
let JS_ENV = '';
// @ts-ignore
if (typeof Deno !== 'undefined') {
    JS_ENV = 'deno';
}
else if (typeof document !== 'undefined') {
    JS_ENV = 'web';
}
else if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    JS_ENV = 'react-native';
}
else {
    JS_ENV = 'node';
}
exports.DEFAULT_HEADERS = { 'X-Client-Info': `supabase-js-${JS_ENV}/${version_1.version}` };
exports.DEFAULT_GLOBAL_OPTIONS = {
    headers: exports.DEFAULT_HEADERS,
};
exports.DEFAULT_DB_OPTIONS = {
    schema: 'public',
};
exports.DEFAULT_AUTH_OPTIONS = {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'implicit',
};
exports.DEFAULT_REALTIME_OPTIONS = {};
//# sourceMappingURL=constants.js.map
}, function(modId) { var map = {"./version":1758427411939}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1758427411939, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.version = void 0;
exports.version = '2.57.4';
//# sourceMappingURL=version.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1758427411940, function(require, module, exports) {

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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchWithAuth = exports.resolveHeadersConstructor = exports.resolveFetch = void 0;
// @ts-ignore
const node_fetch_1 = __importStar(require("@supabase/node-fetch"));
const resolveFetch = (customFetch) => {
    let _fetch;
    if (customFetch) {
        _fetch = customFetch;
    }
    else if (typeof fetch === 'undefined') {
        _fetch = node_fetch_1.default;
    }
    else {
        _fetch = fetch;
    }
    return (...args) => _fetch(...args);
};
exports.resolveFetch = resolveFetch;
const resolveHeadersConstructor = () => {
    if (typeof Headers === 'undefined') {
        return node_fetch_1.Headers;
    }
    return Headers;
};
exports.resolveHeadersConstructor = resolveHeadersConstructor;
const fetchWithAuth = (supabaseKey, getAccessToken, customFetch) => {
    const fetch = (0, exports.resolveFetch)(customFetch);
    const HeadersConstructor = (0, exports.resolveHeadersConstructor)();
    return (input, init) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const accessToken = (_a = (yield getAccessToken())) !== null && _a !== void 0 ? _a : supabaseKey;
        let headers = new HeadersConstructor(init === null || init === void 0 ? void 0 : init.headers);
        if (!headers.has('apikey')) {
            headers.set('apikey', supabaseKey);
        }
        if (!headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${accessToken}`);
        }
        return fetch(input, Object.assign(Object.assign({}, init), { headers }));
    });
};
exports.fetchWithAuth = fetchWithAuth;
//# sourceMappingURL=fetch.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1758427411941, function(require, module, exports) {

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSupabaseUrl = exports.applySettingDefaults = exports.isBrowser = exports.ensureTrailingSlash = exports.uuid = void 0;
function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0, v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
exports.uuid = uuid;
function ensureTrailingSlash(url) {
    return url.endsWith('/') ? url : url + '/';
}
exports.ensureTrailingSlash = ensureTrailingSlash;
const isBrowser = () => typeof window !== 'undefined';
exports.isBrowser = isBrowser;
function applySettingDefaults(options, defaults) {
    var _a, _b;
    const { db: dbOptions, auth: authOptions, realtime: realtimeOptions, global: globalOptions, } = options;
    const { db: DEFAULT_DB_OPTIONS, auth: DEFAULT_AUTH_OPTIONS, realtime: DEFAULT_REALTIME_OPTIONS, global: DEFAULT_GLOBAL_OPTIONS, } = defaults;
    const result = {
        db: Object.assign(Object.assign({}, DEFAULT_DB_OPTIONS), dbOptions),
        auth: Object.assign(Object.assign({}, DEFAULT_AUTH_OPTIONS), authOptions),
        realtime: Object.assign(Object.assign({}, DEFAULT_REALTIME_OPTIONS), realtimeOptions),
        storage: {},
        global: Object.assign(Object.assign(Object.assign({}, DEFAULT_GLOBAL_OPTIONS), globalOptions), { headers: Object.assign(Object.assign({}, ((_a = DEFAULT_GLOBAL_OPTIONS === null || DEFAULT_GLOBAL_OPTIONS === void 0 ? void 0 : DEFAULT_GLOBAL_OPTIONS.headers) !== null && _a !== void 0 ? _a : {})), ((_b = globalOptions === null || globalOptions === void 0 ? void 0 : globalOptions.headers) !== null && _b !== void 0 ? _b : {})) }),
        accessToken: () => __awaiter(this, void 0, void 0, function* () { return ''; }),
    };
    if (options.accessToken) {
        result.accessToken = options.accessToken;
    }
    else {
        // hack around Required<>
        delete result.accessToken;
    }
    return result;
}
exports.applySettingDefaults = applySettingDefaults;
/**
 * Validates a Supabase client URL
 *
 * @param {string} supabaseUrl - The Supabase client URL string.
 * @returns {URL} - The validated base URL.
 * @throws {Error}
 */
function validateSupabaseUrl(supabaseUrl) {
    const trimmedUrl = supabaseUrl === null || supabaseUrl === void 0 ? void 0 : supabaseUrl.trim();
    if (!trimmedUrl) {
        throw new Error('supabaseUrl is required.');
    }
    if (!trimmedUrl.match(/^https?:\/\//i)) {
        throw new Error('Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.');
    }
    try {
        return new URL(ensureTrailingSlash(trimmedUrl));
    }
    catch (_a) {
        throw Error('Invalid supabaseUrl: Provided URL is malformed.');
    }
}
exports.validateSupabaseUrl = validateSupabaseUrl;
//# sourceMappingURL=helpers.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1758427411942, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseAuthClient = void 0;
const auth_js_1 = require("@supabase/auth-js");
class SupabaseAuthClient extends auth_js_1.AuthClient {
    constructor(options) {
        super(options);
    }
}
exports.SupabaseAuthClient = SupabaseAuthClient;
//# sourceMappingURL=SupabaseAuthClient.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1758427411936);
})()
//miniprogram-npm-outsideDeps=["@supabase/auth-js","@supabase/postgrest-js","@supabase/functions-js","@supabase/realtime-js","@supabase/storage-js","@supabase/node-fetch"]
//# sourceMappingURL=index.js.map