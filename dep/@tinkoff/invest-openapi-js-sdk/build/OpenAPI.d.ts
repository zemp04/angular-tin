import 'isomorphic-fetch';
import { CandleResolution, Candles, Currencies, MarketInstrument, MarketInstrumentList, MarketOrderRequest, Operations, Order, Orderbook, PlacedLimitOrder, PlacedMarketOrder, Portfolio, PortfolioPosition, SandboxSetCurrencyBalanceRequest, SandboxSetPositionBalanceRequest, LimitOrderRequest, UserAccounts } from './domain';
import { CandleStreaming, Depth, InstrumentId, Interval, OrderbookStreaming, FIGI, InstrumentInfoStreaming, InstrumentInfoStreamingMetaParams, CandleStreamingMetaParams, StreamingError } from './types';
export * from './types';
export * from './domain';
declare type OpenApiConfig = {
    apiURL: string;
    socketURL: string;
    secretToken: string;
    brokerAccountId?: string;
};
export default class OpenAPI {
    private _streaming;
    private _sandboxCreated;
    private _currentBrokerAccountId;
    private readonly apiURL;
    private readonly secretToken;
    private readonly authHeaders;
    /**
     *
     * @param apiURL REST api url �� [������������](https://tinkoffcreditsystems.github.io/invest-openapi/env/)
     * @param socketURL Streaming api url �� [������������](https://tinkoffcreditsystems.github.io/invest-openapi/env/)
     * @param secretToken ����� ������� �� [��������� ������ �������](https://tinkoffcreditsystems.github.io/invest-openapi/auth/)
     * @param brokerAccountId ����� ����� (�� ��������� - ��������)
     */
    constructor({ apiURL, socketURL, secretToken, brokerAccountId }: OpenApiConfig);
    /**
     * ������ � REST
     */
    private makeRequest;
    /**
     * ����������� ���������
     */
    private sandboxRegister;
    /**
     * ����� ���������� ������� ����� ����� (*undefined* - �������� �� ��������� ��� ����� ��������).
     */
    getCurrentAccountId(): string | undefined;
    /**
     * ����� ��� ���������� ������ ����� �� ���������.
     * @param brokerAccountId - ����� �����. ��� ����� �������� ����� ����� �������� �������� *undefined*.
     */
    setCurrentAccountId(brokerAccountId: string | undefined): void;
    /**
     * ����� ��� ������� ���������
     */
    sandboxClear(): Promise<any>;
    /**
     * ����� ��� ������� ������� �� �������
     * @param params ��. �������� ����
     */
    setPositionBalance(params: SandboxSetPositionBalanceRequest): Promise<void>;
    /**
     * ����� ��� ������� ������� �� �������
     * @param params ��. �������� ����
     */
    setCurrenciesBalance(params: SandboxSetCurrencyBalanceRequest): Promise<void>;
    /**
     * ����� ��� ��������� �������� ��
     */
    portfolio(): Promise<Portfolio>;
    /**
     * ����� ��� ��������� �������� ������� �������
     */
    portfolioCurrencies(): Promise<Currencies>;
    /**
     * ����� ��� ��������� ������ �� ����������� � ��������
     * @param params ��. �������� ����
     */
    instrumentPortfolio(params: InstrumentId): Promise<PortfolioPosition | null>;
    /**
     * ����� ��� ����������� ������
     * @param figi ������������� �����������
     * @param lots ���������� ����� ��� ������
     * @param operation ��� ������
     * @param price ���� �������� ������
     */
    limitOrder({ figi, lots, operation, price, }: LimitOrderRequest & FIGI): Promise<PlacedLimitOrder>;
    /**
     * ����� ��� ����������� ������
     * @param figi ������������� �����������
     * @param lots ���������� ����� ��� ������
     * @param operation ��� ������
     * @param price ���� �������� ������
     */
    marketOrder({ figi, lots, operation }: MarketOrderRequest & FIGI): Promise<PlacedMarketOrder>;
    /**
     * ����� ��� ������ �������� ������
     * @param orderId ������������� ������
     */
    cancelOrder({ orderId }: {
        orderId: string;
    }): Promise<void>;
    /**
     * ����� ��� ��������� ���� �������� ������
     */
    orders(): Promise<Order[]>;
    /**
     * ����� ��� ��������� ���� ��������� �������� ������������
     */
    currencies(): Promise<MarketInstrumentList>;
    /**
     * ����� ��� ��������� ���� ��������� �������� ETF
     */
    etfs(): Promise<MarketInstrumentList>;
    /**
     * ����� ��� ��������� ���� ��������� ���������
     */
    bonds(): Promise<MarketInstrumentList>;
    /**
     * ����� ��� ��������� ���� ��������� �����
     */
    stocks(): Promise<MarketInstrumentList>;
    /**
     * ����� ��� ��������� �������� �� �� �� �����������
     * @param from ������ ���������� ���������� � ������� ISO 8601
     * @param to ����� ���������� ���������� � ������� ISO 8601
     * @param figi Figi-������������� �����������
     */
    operations({ from, to, figi }: {
        from: string;
        to: string;
        figi?: string;
    }): Promise<Operations>;
    /**
     * ����� ��� ��������� ������������ ������ �� FIGI
     * @param from ������ ���������� ���������� � ������� ISO 8601
     * @param to ����� ���������� ���������� � ������� ISO 8601
     * @param figi Figi-������������� �����������
     * @param interval �������� ��� �����
     */
    candlesGet({ from, to, figi, interval, }: {
        from: string;
        to: string;
        figi: string;
        interval?: CandleResolution;
    }): Promise<Candles>;
    /**
     * ����� ��� ��������� �������
     * @param figi Figi-������������� �����������
     * @param depth
     */
    orderbookGet({ figi, depth }: {
        figi: string;
        depth?: Depth;
    }): Promise<Orderbook>;
    /**
     * ����� ��� ������ ������������ �� figi ��� ticker
     * @param params { figi ��� ticker }
     */
    search(params: InstrumentId): Promise<MarketInstrumentList>;
    /**
     * ����� ��� ������ ����������� �� figi ��� ticker
     * @param params { figi ��� ticker }
     */
    searchOne(params: InstrumentId): Promise<MarketInstrument | null>;
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
    orderbook({ figi, depth }: {
        figi: string;
        depth?: Depth;
    }, cb?: (x: OrderbookStreaming) => any): () => void;
    /**
     * ����� ��� �������� �� ������ �� �������� ������� �����������
     * @example ��. ����� [[orderbook]]
     * @param figi ������������� �����������
     * @param interval �������� ��� �����
     * @param cb ������� ��� ��������� ����� ������ �� �����
     * @return ������� ��� ������ ��������
     */
    candle({ figi, interval }: {
        figi: string;
        interval?: Interval;
    }, cb?: (x: CandleStreaming, metaParams: CandleStreamingMetaParams) => any): () => void;
    /**
     * ����� ��� �������� �� ������ �� �����������
     * @example ��. ����� [[orderbook]]
     * @param figi ������������� �����������
     * @param cb ������� ��� ��������� ����� ������ �� �����������
     * @return ������� ��� ������ ��������
     */
    instrumentInfo({ figi }: {
        figi: string;
    }, cb?: (x: InstrumentInfoStreaming, metaParams: InstrumentInfoStreamingMetaParams) => any): () => void;
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
    onStreamingError(cb: (x: StreamingError, metaParams: InstrumentInfoStreamingMetaParams) => any): () => void;
    /**
     * ����� ��� ��������� ���������� ������ �������
     */
    accounts(): Promise<UserAccounts>;
}
