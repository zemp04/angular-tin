'use strict';

require('isomorphic-fetch');
var events = require('events');
var WebSocket = require('ws');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var WebSocket__default = /*#__PURE__*/_interopDefaultLegacy(WebSocket);

/**
 * @hidden
 */
class Streaming extends events.EventEmitter {
    /**
     *
     * @param apiURL REST api url �� [������������](https://tinkoffcreditsystems.github.io/invest-openapi/env/)
     * @param socketURL Streaming api url �� [������������](https://tinkoffcreditsystems.github.io/invest-openapi/env/)
     * @param secretToken ����� ������� �� [��������� ������ �������](https://tinkoffcreditsystems.github.io/invest-openapi/auth/)
     *
     */
    constructor({ url, secretToken }) {
        super();
        this._ws = null;
        this._wsQueue = [];
        this._subscribeMessages = [];
        /**
         * ���������� �������� ����������
         */
        this.handleSocketOpen = (e) => {
            // ��������������� ��������
            if (this._ws && this._subscribeMessages) {
                this._wsQueue.length = 0;
                this._subscribeMessages.forEach((msg) => {
                    this.enqueue(msg);
                });
            }
            this.emit('socket-open', e);
            this.dispatchWsQueue();
            this.socketPingLoop();
        };
        /**
         * ����������� �������� ������ �� ������
         */
        this.socketPingLoop = () => {
            if (this._ws) {
                this._ws.ping('ping');
                this._wsPingTimeout = setTimeout(this.socketPingLoop, 15000);
            }
        };
        /**
         * ���������� �������� ����������
         */
        this.handleSocketClose = (e) => {
            this.emit('socket-close', e);
            this.handleSocketError();
        };
        /**
         * ���������� ������ � ��������������� ��� �������������
         */
        this.handleSocketError = (e) => {
            var _a;
            clearTimeout(this._wsPingTimeout);
            this.emit('socket-error', e);
            if (!this._ws) {
                return;
            }
            const isClosed = [2 /* CLOSING */, 3 /* CLOSED */].includes((_a = this._ws) === null || _a === void 0 ? void 0 : _a.readyState);
            this._ws.off('open', this.handleSocketOpen);
            this._ws.off('message', this.handleSocketMessage);
            this._ws.off('close', this.handleSocketClose);
            this._ws.off('error', this.handleSocketError);
            if (isClosed) {
                this._ws.terminate();
                this._ws = null;
                if (this._subscribeMessages.length) {
                    // �� ������ ��������� ���� ��� �������� ��������
                    this.connect();
                }
            }
        };
        /**
         * ���������� �������� ���������
         */
        this.handleSocketMessage = (m) => {
            const { event: type, payload, time: serverTime } = JSON.parse(m);
            const otherFields = { serverTime };
            if (type === 'error') {
                this.emit('streaming-error', payload, otherFields);
            }
            else {
                this.emit(this.getEventName(type, payload), payload, otherFields);
            }
        };
        this.socketURL = url;
        this.secretToken = secretToken;
        this.authHeaders = {
            Authorization: 'Bearer ' + this.secretToken,
            'Content-Type': 'application/json',
        };
    }
    /**
     * ����������� � �������
     */
    connect() {
        if (this._ws && [1 /* OPEN */, 0 /* CONNECTING */].includes(this._ws.readyState)) {
            return;
        }
        this._ws = new WebSocket__default["default"](this.socketURL, {
            handshakeTimeout: 4000,
            perMessageDeflate: false,
            headers: this.authHeaders,
        });
        this._ws.on('open', this.handleSocketOpen);
        this._ws.on('message', this.handleSocketMessage);
        this._ws.on('close', this.handleSocketClose);
        this._ws.on('error', this.handleSocketError);
    }
    /**
     * ��������� ����� ������
     */
    getEventName(type, params) {
        if (type === 'orderbook') {
            return `${type}-${params.figi}-${params.depth}`;
        }
        if (type === 'candle') {
            return `${type}-${params.figi}-${params.interval}`;
        }
        if (type === 'instrument_info') {
            return `${type}-${params.figi}`;
        }
        if (type === 'error') {
            return 'streaming-error';
        }
        throw new Error(`Unknown type: ${type}`);
    }
    /**
     * ��������� ��������� � ������� �� �������� � �����
     */
    enqueue(command) {
        this._wsQueue.push(command);
        this.dispatchWsQueue();
    }
    /**
     * ������ ������� ��������� �� �������� � �����
     */
    dispatchWsQueue() {
        var _a;
        if (((_a = this._ws) === null || _a === void 0 ? void 0 : _a.readyState) === 1 /* OPEN */) {
            const cb = () => this._wsQueue.length && this.dispatchWsQueue();
            this._ws.send(JSON.stringify(this._wsQueue.shift()), cb);
        }
    }
    /**
     * �������� �� ��������� ������ � ������
     */
    subscribeToSocket({ type, ...params }, cb) {
        if (!this._ws) {
            this.connect();
        }
        let eventName = this.getEventName(type, params);
        const message = { event: `${type}:subscribe`, ...params };
        if (!this.listenerCount(eventName)) {
            this.enqueue(message);
            this._subscribeMessages.push(message);
        }
        const handler = (x) => setImmediate(() => cb(x));
        this.on(eventName, handler);
        return () => {
            var _a;
            this.off(eventName, handler);
            if (!this.listenerCount(eventName)) {
                this.enqueue({ event: `${type}:unsubscribe`, ...params });
                const index = this._subscribeMessages.findIndex((msg) => msg === message);
                if (index !== -1) {
                    this._subscribeMessages.splice(index, 1);
                }
                if (!this._subscribeMessages.length) {
                    (_a = this._ws) === null || _a === void 0 ? void 0 : _a.close();
                }
            }
        };
    }
    orderbook({ figi, depth = 3 }, cb = console.log) {
        return this.subscribeToSocket({ type: 'orderbook', figi, depth }, cb);
    }
    /**
     * ����� ��� �������� �� ������ �� �������� ������� �����������
     * @example ��. ����� [[orderbook]]
     * @param figi ������������� �����������
     * @param interval �������� ��� �����
     * @param cb ������� ��� ��������� ����� ������ �� �����
     * @return ������� ��� ������ ��������
     */
    candle({ figi, interval = '1min' }, cb = console.log) {
        return this.subscribeToSocket({ type: 'candle', figi, interval }, cb);
    }
    /**
     * ����� ��� �������� �� ������ �� �����������
     * @example ��. ����� [[orderbook]]
     * @param figi ������������� �����������
     * @param cb ������� ��� ��������� ����� ������ �� �����������
     * @return ������� ��� ������ ��������
     */
    instrumentInfo({ figi }, cb = console.log) {
        return this.subscribeToSocket({ type: 'instrument_info', figi }, cb);
    }
    /**
     * ����� ��� ��������� ������ �� ������� ���������
     * @example ��. ����� [[onStreamingError]]
     * @param cb
     * @return ������� ��� ������ ��������
     */
    onStreamingError(cb) {
        this.on('streaming-error', cb);
        return () => {
            this.off('streaming-error', cb);
        };
    }
}

const omitUndef = (x) => JSON.parse(JSON.stringify(x));
function getQueryString(params) {
    // must be a number https://github.com/microsoft/TypeScript/issues/32951
    const searchParams = new URLSearchParams(omitUndef(params)).toString();
    return searchParams.length ? `?${searchParams}` : '';
}
class OpenAPI {
    /**
     *
     * @param apiURL REST api url �� [������������](https://tinkoffcreditsystems.github.io/invest-openapi/env/)
     * @param socketURL Streaming api url �� [������������](https://tinkoffcreditsystems.github.io/invest-openapi/env/)
     * @param secretToken ����� ������� �� [��������� ������ �������](https://tinkoffcreditsystems.github.io/invest-openapi/auth/)
     * @param brokerAccountId ����� ����� (�� ��������� - ��������)
     */
    constructor({ apiURL, socketURL, secretToken, brokerAccountId }) {
        this._sandboxCreated = false;
        this._currentBrokerAccountId = undefined;
        this._streaming = new Streaming({ url: socketURL, secretToken });
        this._currentBrokerAccountId = brokerAccountId;
        this.apiURL = apiURL;
        this.secretToken = secretToken;
        this.authHeaders = {
            Authorization: 'Bearer ' + this.secretToken,
            'Content-Type': 'application/json',
        };
    }
    /**
     * ������ � REST
     */
    async makeRequest(url, { method = 'get', query, body } = {}) {
        let requestParams = { method, headers: this.authHeaders };
        let requestUrl = this.apiURL + url + getQueryString(query || {});
        if (method === 'post') {
            requestParams.body = JSON.stringify(body);
        }
        const res = await fetch(requestUrl, requestParams);
        // XXX ��� ��������������� ������ �� API
        if (res.status === 401) {
            throw {
                status: 'Error',
                message: 'Unauthorized! Try to use valid token. https://tinkoffcreditsystems.github.io/invest-openapi/auth/',
            };
        }
        if (res.status === 429) {
            throw {
                status: 'Error',
                message: 'Too Many Requests!',
            };
        }
        if (!res.ok) {
            throw await res.json();
        }
        const data = await res.json();
        return data.payload;
    }
    /**
     * ����������� ���������
     */
    sandboxRegister() {
        if (!this._sandboxCreated) {
            this.makeRequest('/sandbox/register', { method: 'post' });
            this._sandboxCreated = true;
        }
    }
    /**
     * ����� ���������� ������� ����� ����� (*undefined* - �������� �� ��������� ��� ����� ��������).
     */
    getCurrentAccountId() {
        return this._currentBrokerAccountId;
    }
    /**
     * ����� ��� ���������� ������ ����� �� ���������.
     * @param brokerAccountId - ����� �����. ��� ����� �������� ����� ����� �������� �������� *undefined*.
     */
    setCurrentAccountId(brokerAccountId) {
        this._currentBrokerAccountId = brokerAccountId;
    }
    /**
     * ����� ��� ������� ���������
     */
    async sandboxClear() {
        await this.sandboxRegister();
        return this.makeRequest('/sandbox/clear', {
            method: 'post',
            query: { brokerAccountId: this._currentBrokerAccountId },
        });
    }
    /**
     * ����� ��� ������� ������� �� �������
     * @param params ��. �������� ����
     */
    async setPositionBalance(params) {
        await this.sandboxRegister();
        return this.makeRequest('/sandbox/positions/balance', {
            method: 'post',
            query: { brokerAccountId: this._currentBrokerAccountId },
            body: params,
        });
    }
    /**
     * ����� ��� ������� ������� �� �������
     * @param params ��. �������� ����
     */
    async setCurrenciesBalance(params) {
        await this.sandboxRegister();
        return this.makeRequest('/sandbox/currencies/balance', {
            method: 'post',
            query: { brokerAccountId: this._currentBrokerAccountId },
            body: params,
        });
    }
    /**
     * ����� ��� ��������� �������� ��
     */
    portfolio() {
        return this.makeRequest('/portfolio', {
            query: { brokerAccountId: this._currentBrokerAccountId },
        });
    }
    /**
     * ����� ��� ��������� �������� ������� �������
     */
    portfolioCurrencies() {
        return this.makeRequest('/portfolio/currencies', {
            query: { brokerAccountId: this._currentBrokerAccountId },
        });
    }
    /**
     * ����� ��� ��������� ������ �� ����������� � ��������
     * @param params ��. �������� ����
     */
    instrumentPortfolio(params) {
        return this.portfolio().then((x) => {
            return (x.positions.find((position) => {
                if ('figi' in params) {
                    return position.figi === params.figi;
                }
                if ('ticker' in params) {
                    return position.ticker === params.ticker;
                }
            }) || null);
        });
    }
    /**
     * ����� ��� ����������� ������
     * @param figi ������������� �����������
     * @param lots ���������� ����� ��� ������
     * @param operation ��� ������
     * @param price ���� �������� ������
     */
    limitOrder({ figi, lots, operation, price, }) {
        return this.makeRequest('/orders/limit-order', {
            method: 'post',
            query: {
                figi,
                brokerAccountId: this._currentBrokerAccountId,
            },
            body: {
                lots,
                operation,
                price,
            },
        });
    }
    /**
     * ����� ��� ����������� ������
     * @param figi ������������� �����������
     * @param lots ���������� ����� ��� ������
     * @param operation ��� ������
     * @param price ���� �������� ������
     */
    marketOrder({ figi, lots, operation }) {
        return this.makeRequest('/orders/market-order', {
            method: 'post',
            query: {
                figi,
                brokerAccountId: this._currentBrokerAccountId,
            },
            body: {
                lots,
                operation,
            },
        });
    }
    //todo ����������
    /**
     * ����� ��� ������ �������� ������
     * @param orderId ������������� ������
     */
    cancelOrder({ orderId }) {
        return this.makeRequest(`/orders/cancel`, {
            method: 'post',
            query: {
                orderId,
                brokerAccountId: this._currentBrokerAccountId,
            },
        });
    }
    /**
     * ����� ��� ��������� ���� �������� ������
     */
    orders() {
        return this.makeRequest('/orders', {
            query: { brokerAccountId: this._currentBrokerAccountId },
        });
    }
    /**
     * ����� ��� ��������� ���� ��������� �������� ������������
     */
    currencies() {
        return this.makeRequest('/market/currencies');
    }
    /**
     * ����� ��� ��������� ���� ��������� �������� ETF
     */
    etfs() {
        return this.makeRequest('/market/etfs');
    }
    /**
     * ����� ��� ��������� ���� ��������� ���������
     */
    bonds() {
        return this.makeRequest('/market/bonds');
    }
    /**
     * ����� ��� ��������� ���� ��������� �����
     */
    stocks() {
        return this.makeRequest('/market/stocks');
    }
    /**
     * ����� ��� ��������� �������� �� �� �� �����������
     * @param from ������ ���������� ���������� � ������� ISO 8601
     * @param to ����� ���������� ���������� � ������� ISO 8601
     * @param figi Figi-������������� �����������
     */
    operations({ from, to, figi }) {
        return this.makeRequest('/operations', {
            query: {
                from,
                to,
                figi,
                brokerAccountId: this._currentBrokerAccountId,
            },
        });
    }
    /**
     * ����� ��� ��������� ������������ ������ �� FIGI
     * @param from ������ ���������� ���������� � ������� ISO 8601
     * @param to ����� ���������� ���������� � ������� ISO 8601
     * @param figi Figi-������������� �����������
     * @param interval �������� ��� �����
     */
    candlesGet({ from, to, figi, interval = '1min', }) {
        return this.makeRequest('/market/candles', {
            query: { from, to, figi, interval },
        });
    }
    /**
     * ����� ��� ��������� �������
     * @param figi Figi-������������� �����������
     * @param depth
     */
    orderbookGet({ figi, depth = 3 }) {
        return this.makeRequest('/market/orderbook', {
            query: { figi, depth },
        });
    }
    /**
     * ����� ��� ������ ������������ �� figi ��� ticker
     * @param params { figi ��� ticker }
     */
    search(params) {
        if ('figi' in params) {
            return this.makeRequest('/market/search/by-figi', {
                query: { figi: params.figi },
            }).then((x) => (x ? { total: 1, instruments: [x] } : { total: 0, instruments: [] }));
        }
        if ('ticker' in params) {
            return this.makeRequest('/market/search/by-ticker', {
                query: { ticker: params.ticker },
            });
        }
        throw new Error('should specify figi or ticker');
    }
    /**
     * ����� ��� ������ ����������� �� figi ��� ticker
     * @param params { figi ��� ticker }
     */
    searchOne(params) {
        return this.search(params).then((x) => x.instruments[0] || null);
    }
    /**
     * ����� ��� �������� �� ������ �� ������� �����������
     * @example
     * ```typescript
     * const { figi } = await api.searchOne({ ticker: 'AAPL' });
     * const unsubFromAAPL = api.orderbook({ figi }, (ob) => { console.log(ob.bids) });
     * // ... �������� ������ �� �����
     * unsubFromAAPL();
     * ```
     * @param figi ������������� �����������
     * @param depth
     * @param cb ������� ��� ��������� ����� ������ �� �������
     * @return ������� ��� ������ ��������
     */
    orderbook({ figi, depth = 3 }, cb = console.log) {
        return this._streaming.orderbook({ figi, depth }, cb);
    }
    /**
     * ����� ��� �������� �� ������ �� �������� ������� �����������
     * @example ��. ����� [[orderbook]]
     * @param figi ������������� �����������
     * @param interval �������� ��� �����
     * @param cb ������� ��� ��������� ����� ������ �� �����
     * @return ������� ��� ������ ��������
     */
    candle({ figi, interval = '1min' }, cb = console.log) {
        return this._streaming.candle({ figi, interval }, cb);
    }
    /**
     * ����� ��� �������� �� ������ �� �����������
     * @example ��. ����� [[orderbook]]
     * @param figi ������������� �����������
     * @param cb ������� ��� ��������� ����� ������ �� �����������
     * @return ������� ��� ������ ��������
     */
    instrumentInfo({ figi }, cb = console.log) {
        return this._streaming.instrumentInfo({ figi }, cb);
    }
    /**
     * ����� ��� ��������� ��������� �� ������ �� ���������
     * @example
     * ```typescript
     * api.onStreamingError(({ error }) => { console.log(error) });
     * api.instrumentInfo({ figi: 'NOOOOOOO' }, (ob) => { console.log(ob.bids) });
     * // logs:  Subscription instrument_info:subscribe. FIGI NOOOOOOO not found
     * ```
     * @param cb ������� ��� ��������� ���� ������ �� ���������
     * @return ������� ��� ������ ��������
     */
    onStreamingError(cb) {
        return this._streaming.onStreamingError(cb);
    }
    /**
     * ����� ��� ��������� ���������� ������ �������
     */
    accounts() {
        return this.makeRequest('/user/accounts');
    }
}

module.exports = OpenAPI;
