import { OperationType } from "./domain";
export declare type Interval = '1min' | '2min' | '3min' | '5min' | '10min' | '15min' | '30min' | 'hour' | '2hour' | '4hour' | 'day' | 'week' | 'month';
export declare type Depth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export declare type HttpMethod = 'get' | 'post';
export declare type SocketEventType = 'orderbook' | 'candle' | 'instrument_info';
export declare type Dict<T> = {
    [x: string]: T;
};
export declare type OrderbookStreaming = {
    figi: string;
    depth: Depth;
    bids: Array<[number, number]>;
    asks: Array<[number, number]>;
};
export declare type OrderbookStreamingMetaParams = {
    /** ��������� ����� � ������� RFC3339Nano */
    serverTime: string;
};
export declare type InstrumentId = {
    ticker: string;
} | {
    figi: string;
};
export declare type CandleStreaming = {
    o: number;
    c: number;
    h: number;
    l: number;
    v: number;
    time: string;
    interval: Interval;
    figi: string;
};
export declare type CandleStreamingMetaParams = {
    /** ��������� ����� � ������� RFC3339Nano */
    serverTime: string;
};
export declare type InstrumentInfoStreaming = {
    /** ������ ������ */
    trade_status: string;
    /** ��� ���� */
    min_price_increment: number;
    /** ��� */
    lot: number;
    /** ���. ������������ ������ ��� ������ */
    accrued_interest?: number;
    /** ������� ������� ������. ������������ ������ ��� RTS ������������ */
    limit_up?: number;
    /** ������ ������� ������. ������������ ������ ��� RTS ������������ */
    limit_down?: number;
    /** FIGI */
    figi: string;
};
export declare type StreamingError = {
    request_id: string;
    error: string;
};
export declare type InstrumentInfoStreamingMetaParams = {
    /** ��������� ����� � ������� RFC3339Nano */
    serverTime: string;
};
export declare type LimitOrderParams = {
    figi: string;
    lots: number;
    operation: OperationType;
    price: number;
};
export declare type FIGI = {
    figi: string;
};
