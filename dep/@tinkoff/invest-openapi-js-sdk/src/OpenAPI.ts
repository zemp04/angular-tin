import 'isomorphic-fetch';
import {
  CandleResolution,
  Candles,
  Currencies,
  MarketInstrument,
  MarketInstrumentList,
  MarketOrderRequest,
  Operations,
  Order,
  Orderbook,
  PlacedLimitOrder,
  PlacedMarketOrder,
  Portfolio,
  PortfolioPosition,
  SandboxSetCurrencyBalanceRequest,
  SandboxSetPositionBalanceRequest,
  LimitOrderRequest,
  UserAccounts,
} from './domain';
import {
  CandleStreaming,
  Depth,
  HttpMethod,
  InstrumentId,
  Interval,
  OrderbookStreaming,
  FIGI,
  InstrumentInfoStreaming,
  InstrumentInfoStreamingMetaParams,
  CandleStreamingMetaParams,
  StreamingError,
} from './types';
/*import { URLSearchParams } from 'url';*/
import Streaming from './Streaming';

export * from './types';
export * from './domain';

const omitUndef = (x: object) => JSON.parse(JSON.stringify(x));

function getQueryString(params: Record<string, string | number>) {
  // must be a number https://github.com/microsoft/TypeScript/issues/32951
  const searchParams = new URLSearchParams(omitUndef(params) as any).toString();

  return searchParams.length ? `?${searchParams}` : '';
}

type OpenApiConfig = {
  apiURL: string;
  socketURL: string;
  secretToken: string;
  brokerAccountId?: string;
};

type RequestConfig<Q, B> = {
  method?: HttpMethod;
  query?: Q;
  body?: B;
};

export default class OpenAPI {
  private _streaming: Streaming;
  private _sandboxCreated: boolean = false;
  private _currentBrokerAccountId: string | undefined = undefined;
  private readonly apiURL: string;
  private readonly secretToken: string;
  private readonly authHeaders: any;

  /**
   *
   * @param apiURL REST api url �� [������������](https://tinkoffcreditsystems.github.io/invest-openapi/env/)
   * @param socketURL Streaming api url �� [������������](https://tinkoffcreditsystems.github.io/invest-openapi/env/)
   * @param secretToken ����� ������� �� [��������� ������ �������](https://tinkoffcreditsystems.github.io/invest-openapi/auth/)
   * @param brokerAccountId ����� ����� (�� ��������� - ��������)
   */
  constructor({ apiURL, socketURL, secretToken, brokerAccountId }: OpenApiConfig) {
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
  private async makeRequest<Q, B, R>( url: string, { method = 'get', query, body }: RequestConfig<Q, B> = {}): Promise<R> {
    let requestParams: Record<string, any> = { method, headers: this.authHeaders };
    let requestUrl = this.apiURL + url + getQueryString(query || {});

    if (method === 'post') {
      requestParams.body = JSON.stringify(body);
    }

    const res = await fetch(requestUrl, requestParams);

    // XXX ��� ��������������� ������ �� API
    if (res.status === 401) {
      throw {
        status: 'Error',
        message:
          'Unauthorized! Try to use valid token. https://tinkoffcreditsystems.github.io/invest-openapi/auth/',
      };
    }

    if (res.status === 429) {
      throw {
        status: 'Error',
        message:
          'Too Many Requests!',
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
  private sandboxRegister() {
    if (!this._sandboxCreated) {
      this.makeRequest('/sandbox/register', { method: 'post' });
      this._sandboxCreated = true;
    }
  }

  /**
   * ����� ���������� ������� ����� ����� (*undefined* - �������� �� ��������� ��� ����� ��������).
   */
  getCurrentAccountId(): string | undefined {
    return this._currentBrokerAccountId;
  }

  /**
   * ����� ��� ���������� ������ ����� �� ���������.
   * @param brokerAccountId - ����� �����. ��� ����� �������� ����� ����� �������� �������� *undefined*.
   */
  setCurrentAccountId(brokerAccountId: string | undefined): void {
    this._currentBrokerAccountId = brokerAccountId;
  }

  /**
   * ����� ��� ������� ���������
   */
  async sandboxClear(): Promise<any> {
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
  async setPositionBalance(params: SandboxSetPositionBalanceRequest): Promise<void> {
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
  async setCurrenciesBalance(params: SandboxSetCurrencyBalanceRequest): Promise<void> {
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
  portfolio(): Promise<Portfolio> {
    return this.makeRequest('/portfolio', {
      query: { brokerAccountId: this._currentBrokerAccountId },
    });
  }

  /**
   * ����� ��� ��������� �������� ������� �������
   */
  portfolioCurrencies(): Promise<Currencies> {
    return this.makeRequest('/portfolio/currencies', {
      query: { brokerAccountId: this._currentBrokerAccountId },
    });
  }

  /**
   * ����� ��� ��������� ������ �� ����������� � ��������
   * @param params ��. �������� ����
   */
  instrumentPortfolio(params: InstrumentId): Promise<PortfolioPosition | null> {
    return this.portfolio().then((x) => {
      return (
        x.positions.find((position) => {
          if ('figi' in params) {
            return position.figi === params.figi;
          }
          if ('ticker' in params) {
            return position.ticker === params.ticker;
          }
        }) || null
      );
    });
  }

  /**
   * ����� ��� ����������� ������
   * @param figi ������������� �����������
   * @param lots ���������� ����� ��� ������
   * @param operation ��� ������
   * @param price ���� �������� ������
   */
  limitOrder({
    figi,
    lots,
    operation,
    price,
  }: LimitOrderRequest & FIGI): Promise<PlacedLimitOrder> {
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
  marketOrder({ figi, lots, operation }: MarketOrderRequest & FIGI): Promise<PlacedMarketOrder> {
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
  cancelOrder({ orderId }: { orderId: string }): Promise<void> {
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
  orders(): Promise<Order[]> {
    return this.makeRequest('/orders', {
      query: { brokerAccountId: this._currentBrokerAccountId },
    });
  }

  /**
   * ����� ��� ��������� ���� ��������� �������� ������������
   */
  currencies(): Promise<MarketInstrumentList> {
    return this.makeRequest('/market/currencies');
  }

  /**
   * ����� ��� ��������� ���� ��������� �������� ETF
   */
  etfs(): Promise<MarketInstrumentList> {
    return this.makeRequest('/market/etfs');
  }

  /**
   * ����� ��� ��������� ���� ��������� ���������
   */
  bonds(): Promise<MarketInstrumentList> {
    return this.makeRequest('/market/bonds');
  }

  /**
   * ����� ��� ��������� ���� ��������� �����
   */
  stocks(): Promise<MarketInstrumentList> {
    return this.makeRequest('/market/stocks');
  }

  /**
   * ����� ��� ��������� �������� �� �� �� �����������
   * @param from ������ ���������� ���������� � ������� ISO 8601
   * @param to ����� ���������� ���������� � ������� ISO 8601
   * @param figi Figi-������������� �����������
   */
  operations({ from, to, figi }: { from: string; to: string; figi?: string }): Promise<Operations> {
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
  candlesGet({
    from,
    to,
    figi,
    interval = '1min',
  }: {
    from: string;
    to: string;
    figi: string;
    interval?: CandleResolution;
  }): Promise<Candles> {
    return this.makeRequest('/market/candles', {
      query: { from, to, figi, interval },
    });
  }

  /**
   * ����� ��� ��������� �������
   * @param figi Figi-������������� �����������
   * @param depth
   */
  orderbookGet({ figi, depth = 3 }: { figi: string; depth?: Depth }): Promise<Orderbook> {
    return this.makeRequest('/market/orderbook', {
      query: { figi, depth },
    });
  }
  /**
   * ����� ��� ������ ������������ �� figi ��� ticker
   * @param params { figi ��� ticker }
   */
  search(params: InstrumentId): Promise<MarketInstrumentList> {
    if ('figi' in params) {
      return this.makeRequest<any, never, MarketInstrument>('/market/search/by-figi', {
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
  searchOne(params: InstrumentId): Promise<MarketInstrument | null> {
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
  orderbook(
    { figi, depth = 3 }: { figi: string; depth?: Depth },
    cb: (x: OrderbookStreaming) => any = console.log
  ) {
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
  candle(
    { figi, interval = '1min' }: { figi: string; interval?: Interval },
    cb: (x: CandleStreaming, metaParams: CandleStreamingMetaParams) => any = console.log
  ) {
    return this._streaming.candle({ figi, interval }, cb);
  }

  /**
   * ����� ��� �������� �� ������ �� �����������
   * @example ��. ����� [[orderbook]]
   * @param figi ������������� �����������
   * @param cb ������� ��� ��������� ����� ������ �� �����������
   * @return ������� ��� ������ ��������
   */
  instrumentInfo({ figi }: { figi: string }, cb: (x: InstrumentInfoStreaming, metaParams: InstrumentInfoStreamingMetaParams) => any = console.log) {
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
  onStreamingError(cb: (x: StreamingError, metaParams: InstrumentInfoStreamingMetaParams) => any) {
    return this._streaming.onStreamingError(cb);
  }

  /**
   * ����� ��� ��������� ���������� ������ �������
   */
  accounts(): Promise<UserAccounts> {
    return this.makeRequest('/user/accounts');
  }
}