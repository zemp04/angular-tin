import { EventEmitter } from 'events';
import WebSocket from 'ws';
import {
  CandleStreaming,
  CandleStreamingMetaParams,
  Depth,
  Dict,
  InstrumentInfoStreaming,
  InstrumentInfoStreamingMetaParams,
  Interval,
  OrderbookStreaming,
  OrderbookStreamingMetaParams,
  SocketEventType,
  StreamingError,
} from './types';

/**
 * @hidden
 */
const enum ReadyState {
  'CONNECTING',
  'OPEN',
  'CLOSING',
  'CLOSED',
}

/**
 * @hidden
 */
export default class Streaming extends EventEmitter {
  private _ws: WebSocket | null = null;
  private _wsPingTimeout?: NodeJS.Timeout;
  private _wsQueue: object[] = [];
  private _subscribeMessages: object[] = [];
  private readonly socketURL: string;
  private readonly secretToken: string;
  private readonly authHeaders: any;

  /**
   *
   * @param apiURL REST api url �� [������������](https://tinkoffcreditsystems.github.io/invest-openapi/env/)
   * @param socketURL Streaming api url �� [������������](https://tinkoffcreditsystems.github.io/invest-openapi/env/)
   * @param secretToken ����� ������� �� [��������� ������ �������](https://tinkoffcreditsystems.github.io/invest-openapi/auth/)
   *
   */
  constructor({ url, secretToken }: { url: string; secretToken: string }) {
    super();
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
  private connect() {
    if (this._ws && [ReadyState.OPEN, ReadyState.CONNECTING].includes(this._ws.readyState)) {
      return;
    }

    this._ws = new WebSocket(this.socketURL, {
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
   * ���������� �������� ����������
   */
  private handleSocketOpen = (e: Event) => {
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
  private socketPingLoop = () => {
    if (this._ws) {
      this._ws.ping('ping');

      this._wsPingTimeout = setTimeout(this.socketPingLoop, 15000)
    }
  }

  /**
   * ���������� �������� ����������
   */
  private handleSocketClose = (e: Event) => {
    this.emit('socket-close', e);
    this.handleSocketError();
  };

  /**
   * ���������� ������ � ��������������� ��� �������������
   */
  private handleSocketError = (e?: Error) => {
    clearTimeout(this._wsPingTimeout!);
    this.emit('socket-error', e);

    if (!this._ws) {
      return;
    }

    const isClosed = [ReadyState.CLOSING, ReadyState.CLOSED].includes(this._ws?.readyState!);

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
  private handleSocketMessage = (m: string) => {
    const { event: type, payload, time: serverTime } = JSON.parse(m);

    const otherFields = { serverTime };

    if (type === 'error') {
      this.emit('streaming-error', payload, otherFields);
    } else {
      this.emit(this.getEventName(type, payload), payload, otherFields);
    }
  };

  /**
   * ��������� ����� ������
   */
  private getEventName(type: SocketEventType, params: Dict<string>) {
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
  private enqueue(command: object) {
    this._wsQueue.push(command);
    this.dispatchWsQueue();
  }

  /**
   * ������ ������� ��������� �� �������� � �����
   */
  private dispatchWsQueue() {
    if (this._ws?.readyState === ReadyState.OPEN) {
      const cb = () => this._wsQueue.length && this.dispatchWsQueue();

      this._ws.send(JSON.stringify(this._wsQueue.shift()), cb);
    }
  }

  /**
   * �������� �� ��������� ������ � ������
   */
  private subscribeToSocket({ type, ...params }: any, cb: Function) {
    if (!this._ws) {
      this.connect();
    }
    let eventName = this.getEventName(type, params);
    const message = { event: `${type}:subscribe`, ...params };
    if (!this.listenerCount(eventName)) {
      this.enqueue(message);
      this._subscribeMessages.push(message);
    }

    const handler = (x: any) => setImmediate(() => cb(x));

    this.on(eventName, handler);

    return () => {
      this.off(eventName, handler);

      if (!this.listenerCount(eventName)) {
        this.enqueue({ event: `${type}:unsubscribe`, ...params });
        const index = this._subscribeMessages.findIndex((msg) => msg === message);

        if (index !== -1) {
          this._subscribeMessages.splice(index, 1);
        }
        if (!this._subscribeMessages.length) {
          this._ws?.close();
        }
      }
    };
  }

  orderbook(
    { figi, depth = 3 }: { figi: string; depth?: Depth },
    cb: (x: OrderbookStreaming, metaParams: OrderbookStreamingMetaParams) => any = console.log
  ) {
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
  candle(
    { figi, interval = '1min' }: { figi: string; interval?: Interval },
    cb: (x: CandleStreaming, metaParams: CandleStreamingMetaParams) => any = console.log
  ) {
    return this.subscribeToSocket({ type: 'candle', figi, interval }, cb);
  }

  /**
   * ����� ��� �������� �� ������ �� �����������
   * @example ��. ����� [[orderbook]]
   * @param figi ������������� �����������
   * @param cb ������� ��� ��������� ����� ������ �� �����������
   * @return ������� ��� ������ ��������
   */
  instrumentInfo({ figi }: { figi: string }, cb: (x: InstrumentInfoStreaming, metaParams: InstrumentInfoStreamingMetaParams) => any = console.log) {
    return this.subscribeToSocket({ type: 'instrument_info', figi }, cb);
  }

  /**
   * ����� ��� ��������� ������ �� ������� ���������
   * @example ��. ����� [[onStreamingError]]
   * @param cb
   * @return ������� ��� ������ ��������
   */
  onStreamingError(cb: (x: StreamingError, metaParams: InstrumentInfoStreamingMetaParams) => any) {
    this.on('streaming-error', cb);

    return () => {
      this.off('streaming-error', cb);
    }
  }
}