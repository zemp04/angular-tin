/// <reference types="node" />
import { EventEmitter } from 'events';
import { CandleStreaming, CandleStreamingMetaParams, Depth, InstrumentInfoStreaming, InstrumentInfoStreamingMetaParams, Interval, OrderbookStreaming, OrderbookStreamingMetaParams, StreamingError } from './types';
/**
 * @hidden
 */
export default class Streaming extends EventEmitter {
    private _ws;
    private _wsPingTimeout?;
    private _wsQueue;
    private _subscribeMessages;
    private readonly socketURL;
    private readonly secretToken;
    private readonly authHeaders;
    /**
     *
     * @param apiURL REST api url �� [������������](https://tinkoffcreditsystems.github.io/invest-openapi/env/)
     * @param socketURL Streaming api url �� [������������](https://tinkoffcreditsystems.github.io/invest-openapi/env/)
     * @param secretToken ����� ������� �� [��������� ������ �������](https://tinkoffcreditsystems.github.io/invest-openapi/auth/)
     *
     */
    constructor({ url, secretToken }: {
        url: string;
        secretToken: string;
    });
    /**
     * ����������� � �������
     */
    private connect;
    /**
     * ���������� �������� ����������
     */
    private handleSocketOpen;
    /**
     * ����������� �������� ������ �� ������
     */
    private socketPingLoop;
    /**
     * ���������� �������� ����������
     */
    private handleSocketClose;
    /**
     * ���������� ������ � ��������������� ��� �������������
     */
    private handleSocketError;
    /**
     * ���������� �������� ���������
     */
    private handleSocketMessage;
    /**
     * ��������� ����� ������
     */
    private getEventName;
    /**
     * ��������� ��������� � ������� �� �������� � �����
     */
    private enqueue;
    /**
     * ������ ������� ��������� �� �������� � �����
     */
    private dispatchWsQueue;
    /**
     * �������� �� ��������� ������ � ������
     */
    private subscribeToSocket;
    orderbook({ figi, depth }: {
        figi: string;
        depth?: Depth;
    }, cb?: (x: OrderbookStreaming, metaParams: OrderbookStreamingMetaParams) => any): () => void;
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
     * ����� ��� ��������� ������ �� ������� ���������
     * @example ��. ����� [[onStreamingError]]
     * @param cb
     * @return ������� ��� ������ ��������
     */
    onStreamingError(cb: (x: StreamingError, metaParams: InstrumentInfoStreamingMetaParams) => any): () => void;
}
