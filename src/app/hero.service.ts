import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { MessageService } from './message.service';

import OpenAPI, {
  MarketInstrumentList,
  MarketInstrument,
} from '@tinkoff/invest-openapi-js-sdk';

import { environment } from './../environments/environment';

const apiURL = environment.url;
// Для Production-окружения будет https://api-invest.tinkoff.ru/openapi
const socketURL = 'wss://api-invest.tinkoff.ru/openapi/md/v1/md-openapi/ws';
const secretToken = 'xxx'; // токен для сандбокса
const api = new OpenAPI({ apiURL, secretToken, socketURL });

@Injectable({ providedIn: 'root' })
export class HeroService {
  private heroesUrl = 'api/heroes'; // URL to web api

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) {}

  /** GET stocks from the server */
  getStocks(): Promise<any> {
    return api.stocks();
  }
  /** GET etf from the server */
  getETF(): Promise<any> {
    return api.etfs();
  }
  /** GET Bounds from the server */
  getBounds(): Promise<any> {
    return api.bonds();
  }

  /** GET Currencies from the server */
  getCurrencies(): Promise<any> {
    return api.currencies();
  }

  /** GET hero by id. Return `undefined` when id not found */
  // getHeroNo404<Data>(id: number): Observable<Hero> {
  //   const url = `${this.heroesUrl}/?id=${id}`;
  //   return this.http.get<Hero[]>(url).pipe(
  //     map((heroes) => heroes[0]), // returns a {0|1} element array
  //     tap((h) => {
  //       const outcome = h ? `fetched` : `did not find`;
  //       this.log(`${outcome} hero id=${id}`);
  //     }),
  //     catchError(this.handleError<Hero>(`getHero id=${id}`))
  //   );
  // }

  /** GET hero by id. Will 404 if id not found */
  getStock(fig: any): Promise<any> {
    return api.searchOne({ figi: fig });
    // const url = `${this.heroesUrl}/${id}`;
    // return this.http.get<Hero>(url).pipe(
    //   tap((_) => this.log(`fetched hero id=${id}`)),
    //   catchError(this.handleError<Hero>(`getHero id=${id}`))
    // );
  }

  /* GET heroes whose name contains search term */
  searchHeroes(term: string): Promise<any> {
    return api.search({ ticker: term });
    // return this.http.get<Hero[]>(`${this.heroesUrl}/?name=${term}`).pipe(
    //   tap((x) =>
    //     x.length
    //       ? this.log(`found heroes matching "${term}"`)
    //       : this.log(`no heroes matching "${term}"`)
    //   ),
    //   catchError(this.handleError<Hero[]>('searchHeroes', []))
    // );
  }

  //////// Save methods //////////
  saveFav(favorites: MarketInstrument[]): void {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }

  getFav(): MarketInstrument[] {
    try {
      let str = localStorage.getItem("favorites");
      if (str === null) return [];
      return JSON.parse(str);
    } catch (e) {
      console.error('Error getting favorites from localStorage', e);
      return [];
    }
    // const url = `${this.heroesUrl}/${id}`;
    // return this.http.delete<Hero>(url, this.httpOptions).pipe(
    //   tap((_) => this.log(`deleted hero id=${id}`)),
    //   catchError(this.handleError<Hero>('deleteHero'))
    // );
    return [];
  }
  
  /** PUT: update the hero on the server */
  updateStock(stock: MarketInstrument): void {
    // return this.http.put(this.heroesUrl, hero, this.httpOptions).pipe(
    //   tap((_) => this.log(`updated hero id=${hero.id}`)),
    //   catchError(this.handleError<any>('updateHero'))
    // );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /** Log a HeroService message with the MessageService */
  private log(message: string) {
    this.messageService.add(`HeroService: ${message}`);
  }
}

/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at https://angular.io/license
*/
