/**
** This file was generated automatically by @tinkoff/invest-types-generator
** do not try amending it manually
**/
export declare type Empty = {
    trackingId: string;
    payload: any;
    status: string;
};
export declare type Error = {
    trackingId: string;
    status: string;
    payload: ErrorPayload;
};
export declare type PortfolioResponse = {
    trackingId: string;
    status: string;
    payload: Portfolio;
};
export declare type Portfolio = {
    positions: PortfolioPosition[];
};
export declare type UserAccountsResponse = {
    trackingId: string;
    status: string;
    payload: UserAccounts;
};
export declare type UserAccounts = {
    accounts: UserAccount[];
};
export declare type UserAccount = {
    brokerAccountType: BrokerAccountType;
    brokerAccountId: string;
};
export declare type PortfolioCurrenciesResponse = {
    trackingId: string;
    status: string;
    payload: Currencies;
};
export declare type Currencies = {
    currencies: CurrencyPosition[];
};
export declare type CurrencyPosition = {
    currency: Currency;
    balance: number;
    blocked?: number;
};
export declare type PortfolioPosition = {
    figi: string;
    ticker?: string;
    isin?: string;
    instrumentType: InstrumentType;
    balance: number;
    blocked?: number;
    expectedYield?: MoneyAmount;
    lots: number;
    averagePositionPrice?: MoneyAmount;
    averagePositionPriceNoNkd?: MoneyAmount;
    name: string;
};
export declare type MoneyAmount = {
    currency: Currency;
    value: number;
};
export declare type OrderbookResponse = {
    trackingId: string;
    status: string;
    payload: Orderbook;
};
export declare type Orderbook = {
    figi: string;
    depth: number;
    bids: OrderResponse[];
    asks: OrderResponse[];
    tradeStatus: TradeStatus;
    minPriceIncrement: number;
    faceValue?: number;
    lastPrice?: number;
    closePrice?: number;
    limitUp?: number;
    limitDown?: number;
};
export declare type OrderResponse = {
    price: number;
    quantity: number;
};
export declare type CandlesResponse = {
    trackingId: string;
    status: string;
    payload: Candles;
};
export declare type Candles = {
    figi: string;
    interval: CandleResolution;
    candles: Candle[];
};
export declare type Candle = {
    figi: string;
    interval: CandleResolution;
    o: number;
    c: number;
    h: number;
    l: number;
    v: number;
    time: string;
};
export declare type OperationsResponse = {
    trackingId: string;
    status: string;
    payload: Operations;
};
export declare type Operations = {
    operations: Operation[];
};
export declare type OperationTrade = {
    tradeId: string;
    date: string;
    price: number;
    quantity: number;
};
export declare type Operation = {
    id: string;
    status: OperationStatus;
    trades?: OperationTrade[];
    commission?: MoneyAmount;
    currency: Currency;
    payment: number;
    price?: number;
    quantity?: number;
    quantityExecuted?: number;
    figi?: string;
    instrumentType?: InstrumentType;
    isMarginCall: boolean;
    date: string;
    operationType?: OperationTypeWithCommission;
};
export declare type OrdersResponse = {
    trackingId: string;
    status: string;
    payload: Order[];
};
export declare type Order = {
    orderId: string;
    figi: string;
    operation: OperationType;
    status: OrderStatus;
    requestedLots: number;
    executedLots: number;
    type: OrderType;
    price: number;
};
export declare type LimitOrderRequest = {
    lots: number;
    operation: OperationType;
    price: number;
};
export declare type LimitOrderResponse = {
    trackingId: string;
    status: string;
    payload: PlacedLimitOrder;
};
export declare type PlacedLimitOrder = {
    orderId: string;
    operation: OperationType;
    status: OrderStatus;
    rejectReason?: string;
    message?: string;
    requestedLots: number;
    executedLots: number;
    commission?: MoneyAmount;
};
export declare type MarketOrderRequest = {
    lots: number;
    operation: OperationType;
};
export declare type MarketOrderResponse = {
    trackingId: string;
    status: string;
    payload: PlacedMarketOrder;
};
export declare type PlacedMarketOrder = {
    orderId: string;
    operation: OperationType;
    status: OrderStatus;
    rejectReason?: string;
    message?: string;
    requestedLots: number;
    executedLots: number;
    commission?: MoneyAmount;
};
export declare type TradeStatus = "NormalTrading" | "NotAvailableForTrading";
export declare type OperationType = "Buy" | "Sell";
export declare type OperationTypeWithCommission = "Buy" | "BuyCard" | "Sell" | "BrokerCommission" | "ExchangeCommission" | "ServiceCommission" | "MarginCommission" | "OtherCommission" | "PayIn" | "PayOut" | "Tax" | "TaxLucre" | "TaxDividend" | "TaxCoupon" | "TaxBack" | "Repayment" | "PartRepayment" | "Coupon" | "Dividend" | "SecurityIn" | "SecurityOut";
export declare type OperationStatus = "Done" | "Decline" | "Progress";
export declare type CandleResolution = "1min" | "2min" | "3min" | "5min" | "10min" | "15min" | "30min" | "hour" | "day" | "week" | "month";
export declare type OrderStatus = "New" | "PartiallyFill" | "Fill" | "Cancelled" | "Replaced" | "PendingCancel" | "Rejected" | "PendingReplace" | "PendingNew";
export declare type OrderType = "Limit" | "Market";
export declare type SandboxRegisterRequest = {
    brokerAccountType?: BrokerAccountType;
};
export declare type SandboxRegisterResponse = {
    trackingId: string;
    status: string;
    payload: SandboxAccount;
};
export declare type SandboxAccount = {
    brokerAccountType: BrokerAccountType;
    brokerAccountId: string;
};
export declare type SandboxSetCurrencyBalanceRequest = {
    currency: SandboxCurrency;
    balance: number;
};
export declare type SandboxSetPositionBalanceRequest = {
    figi?: string;
    balance: number;
};
export declare type MarketInstrumentListResponse = {
    trackingId: string;
    status: string;
    payload: MarketInstrumentList;
};
export declare type MarketInstrumentList = {
    total: number;
    instruments: MarketInstrument[];
};
export declare type SearchMarketInstrumentResponse = {
    trackingId: string;
    status: string;
    payload: SearchMarketInstrument;
};
export declare type MarketInstrumentResponse = {
    trackingId: string;
    status: string;
    payload: MarketInstrument;
};
export declare type SearchMarketInstrument = {
    figi: string;
    ticker: string;
    isin?: string;
    minPriceIncrement?: number;
    lot: number;
    currency?: Currency;
    name: string;
    type: InstrumentType;
};
export declare type MarketInstrument = {
    figi: string;
    ticker: string;
    isin?: string;
    minPriceIncrement?: number;
    lot: number;
    minQuantity?: number;
    currency?: Currency;
    name: string;
    type: InstrumentType;
};
export declare type SandboxCurrency = "RUB" | "USD" | "EUR" | "GBP" | "HKD" | "CHF" | "JPY" | "CNY" | "TRY";
export declare type Currency = "RUB" | "USD" | "EUR" | "GBP" | "HKD" | "CHF" | "JPY" | "CNY" | "TRY";
export declare type InstrumentType = "Stock" | "Currency" | "Bond" | "Etf";
export declare type BrokerAccountType = "Tinkoff" | "TinkoffIis";
export declare type ErrorPayload = {
    message?: string;
    code?: string;
};
