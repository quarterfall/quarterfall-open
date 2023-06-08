export class Url {
    /** whether the url is tls terminated or not */
    protected _https: boolean = false;

    /** url host */
    protected _host: string | null = null;

    /** port of the url */
    protected _port: number | null = null;

    /** path within the domain */
    protected _path: string | null = null;

    /** hash string */
    protected _hash: string | null = null;

    /** object containing query key-value pairs */
    protected _query: object = {};

    /**
     * Creates an instance of Url.
     *
     * @param {string} [url]        url from which to construct the object
     *
     * @memberof F4Url
     */
    constructor(url?: string, query?: object) {
        if (url) {
            this.fromString(url);
        }
        if (query) {
            this._query = query;
        }
    }

    /**
     * Clears the current URL object.
     *
     * @memberof F4Url
     */
    public clear() {
        this._https = false;
        this._host = null;
        this._path = null;
        this._hash = null;
        this._query = {};
    }

    /**
     * Creates a F4Url object containing the URL that is currently shown.
     *
     * @readonly
     * @static
     * @type {F4Url}
     * @memberof F4Url
     */
    public static get current(): Url {
        return new Url(window.location.href);
    }

    /**
     * Clears the current object and parses the URL provided as a parameter. This also decodes
     * the URL query parameters.
     *
     * @param {string} url          url from which to construct the object
     *
     * @memberof F4Url
     */
    public fromString(url: string) {
        this.clear();
        this._https = url.startsWith("https://");

        // remove the http(s) part
        const splitUrl = url.split("://");
        if (splitUrl.length > 1) {
            url = splitUrl[1];
        }

        // extract the hash
        const splitHash = url.split("#");
        if (splitHash.length > 1) {
            this._hash = decodeURIComponent(splitHash[1]);
            url = splitHash[0];
        }

        // extract the query string
        const splitQuery = url.split("?");
        if (splitQuery.length > 1) {
            url = splitQuery[0];
            this._query = Url.parseQueryString(splitQuery[1]);
        }

        // extract the host and the path
        if (url.indexOf(".") >= 0 || url.indexOf("localhost") >= 0) {
            // both host and path
            const splitHost = url.split("/");
            if (splitHost.length > 1) {
                this._path = splitHost.slice(1).join("/");
            }
            // extract the port
            const hostAndPort = splitHost[0].split(":");
            this._host = hostAndPort[0];
            if (hostAndPort.length > 1) {
                this._port = Number(hostAndPort[1]);
            }
        } else {
            // path only
            if (url.startsWith("/")) {
                url = url.substr(1);
            }
            this._path = url;
        }
    }

    /**
     * Returns a string representation of this URL. This automatically encodes the
     * URL query parameters.
     *
     * @returns {string}            a string representing this URL
     *
     * @memberof F4Url
     */
    public toString(encodeHash: boolean = true): string {
        let url = "";

        if (this._host) {
            url = this._https ? "https://" : "http://";
            // add the host
            url += this._host;
        }

        // add the port
        if (this._port) {
            url += ":" + this._port;
        }

        // add the path
        if (this._path) {
            url += "/" + this._path;
        }

        // add the query string
        if (this.queryKeys.length > 0) {
            url += "?" + Url.constructQueryString(this._query);
        }

        // add the hash
        if (this._hash) {
            const hash = encodeHash
                ? encodeURIComponent(this._hash)
                : this._hash;
            url += `#${hash}`;
        }

        return url || "/";
    }

    // *************************************************************
    // Getters and setters for the URL components
    // *************************************************************

    public get https(): boolean {
        return this._https;
    }
    public set https(value: boolean) {
        this._https = value;
    }

    public get host(): string {
        return this._host || "";
    }
    public set host(value: string) {
        // remove the trailing slash if any
        if (value.endsWith("/")) {
            value = value.substr(0, value.length - 1);
        }
        // check if the domain contains a http or https prefix and if so, remove it
        if (value.startsWith("http")) {
            this._https = value.startsWith("https://");
            // remove the http(s) part
            const splitUrl = value.split("://");
            if (splitUrl.length > 1) {
                value = splitUrl[1];
            }
        }
        this._host = value;
    }

    public get port(): number {
        return this._port || 0;
    }
    public set port(value: number) {
        this._port = value;
    }

    /**
     * Getter that returns the (simplified) subdomain for a URL. In effect, this returns the
     * string before the first point in the domain name. E.g. if the domain name is "mysite.fans4music.com",
     * this returns "mysite". Note that if the domain is "henk.westbroek.fans4music.com", this returns "henk"
     * and not "henk.westbroek". This has nothing to do with our relationship to Henk Westbroek.
     *
     * @readonly
     * @type {string}
     * @memberof F4Url
     */
    public get subdomain(): string | null {
        const splitDomain = this.host.split(".");
        if (splitDomain.length > 1) {
            return splitDomain[0];
        } else {
            return null;
        }
    }

    public get path(): string {
        return this._path || "";
    }
    public set path(value: string) {
        // remove the preceding slash if any
        if (value.startsWith("/")) {
            value = value.substr(1);
        }
        this._path = value;
    }

    public get hash(): string {
        return this._hash || "";
    }
    public set hash(value: string) {
        // remove the preceding hash if any
        if (value.startsWith("#")) {
            value = value.substr(1);
        }
        this._hash = value;
    }

    public get query(): object {
        return this._query;
    }
    public set query(value: object) {
        this._query = value;
    }

    /**
     * Indicates whether the query string has a given key.
     *
     * @param {string} key      the key
     * @returns {boolean}       true if the key exists in the query string; false otherwise
     *
     * @memberof F4Url
     */
    public queryHasKey(key: string): boolean {
        return this._query.hasOwnProperty(key);
    }

    /**
     * Removes a key-value pair from the query string.
     *
     * @param {string} key      the key to remove
     *
     * @memberof F4Url
     */
    public queryRemove(key: string) {
        if (this._query.hasOwnProperty(key)) {
            delete this._query[key];
        }
    }

    /**
     * Sets a value for a given key. If the key already exists, the existing value is
     * overridden. If the key doesn't exist, a new key-value pair is created.
     *
     * @param {string} key              the key to set
     * @param {F4JsonValue} value       the (new) value
     *
     * @memberof F4Url
     */
    public querySet(key: string, value: any) {
        this._query[key] = value;
    }

    public queryGet(key: string): any {
        return this._query[key];
    }

    /**
     * Clears all the query parameters.
     */
    public queryClear() {
        this._query = {};
    }

    /**
     * Returns the list of keys defined in the query string.
     *
     * @readonly
     * @type {string[]}
     * @memberof F4Url
     */
    public get queryKeys(): string[] {
        const keys: string[] = [];
        for (const key in this._query) {
            if (this._query.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys;
    }

    // *************************************************************
    // A few helper methods for parsing and generating query strings
    // *************************************************************

    /**
     * Parses a query string and returns a JSON object containing the decoded key-value pairs. The query
     * string is the part behind the & sign, and before the hash.
     *
     * @static
     * @param {string} queryString              the query string to parse
     * @returns {F4JsonObject}                  a JSON object containing the decoded key-value pairs
     *
     * @memberof F4Url
     */
    public static parseQueryString(queryString: string): object {
        if (!queryString) {
            return {};
        }
        queryString = decodeURI(queryString);
        // Split into separate parameters
        const parameters = queryString.split("&");
        // Convert each to an name: value pair
        const result = {};
        for (const param of parameters) {
            const pair = param.split("=");
            result[pair[0]] = decodeURIComponent(pair[1]);
        }
        return result;
    }

    /**
     * Constructs an encoded query string from a JSON object containing key-value pairs.
     *
     * @static
     * @param {F4JsonObject} json       a JSON object containing key-value pairs
     * @returns {string}                encoded query string
     *
     * @memberof F4Url
     */

    public static constructQueryString(json: object): string {
        let queryStr = "";
        for (const key in json) {
            if (json.hasOwnProperty(key)) {
                if (queryStr !== "") {
                    queryStr += "&";
                }
                queryStr += key + "=" + encodeURIComponent(json[key] as string);
            }
        }
        return queryStr;
    }
}
