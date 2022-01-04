import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Hero } from './hero';

@Injectable({
  providedIn: 'root',
})
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const heroes = [
      {
        figi: 'BBG000HLJ7M4',
        ticker: 'IDCC',
        class_code: 'SPBXM',
        isin: 'US45867G1013',
        lot: 1,
        currency: 'usd',
        klong: 0,
        kshort: 0,
        dlong: 0,
        dshort: 0,
        dlong_min: 0,
        dshort_min: 0,
        short_enabled_flag: false,
        name: 'InterDigItal Inc',
        exchange: 'SPB',
        ipo_date: {
          seconds: '373420800',
          nanos: 0,
        },
        issue_size: '33842244',
        country_of_risk: 'US',
        country_of_risk_name: 'Соединенные Штаты Америки',
        sector: 'it',
        issue_size_plan: '100000000',
        nominal: {
          currency: 'usd',
          units: '0',
          nano: 10000000,
        },
        trading_status: 'SECURITY_TRADING_STATUS_NORMAL_TRADING',
        otc_flag: false,
        buy_available_flag: true,
        sell_available_flag: true,
        div_yield_flag: true,
        share_type: 'SHARE_TYPE_COMMON',
        min_price_increment: 0.009999999776482582,
        api_trade_available_flag: true,
      },
      {
        figi: 'BBG002293PJ4',
        ticker: 'RH',
        class_code: 'SPBXM',
        isin: 'US74967X1037',
        lot: 1,
        currency: 'usd',
        klong: 0,
        kshort: 0,
        dlong: 0,
        dshort: 0,
        dlong_min: 0,
        dshort_min: 0,
        short_enabled_flag: false,
        name: 'RH',
        exchange: 'SPB',
        ipo_date: {
          seconds: '1351814400',
          nanos: 0,
        },
        issue_size: '21152191',
        country_of_risk: 'US',
        country_of_risk_name: 'Соединенные Штаты Америки',
        sector: 'consumer',
        issue_size_plan: '180000000',
        nominal: {
          currency: 'usd',
          units: '0',
          nano: 100000,
        },
        trading_status: 'SECURITY_TRADING_STATUS_NORMAL_TRADING',
        otc_flag: false,
        buy_available_flag: true,
        sell_available_flag: true,
        div_yield_flag: false,
        share_type: 'SHARE_TYPE_COMMON',
        min_price_increment: 0.009999999776482582,
        api_trade_available_flag: true,
      },
      {
        figi: 'BBG000BH0FR6',
        ticker: 'SGEN',
        class_code: 'SPBXM',
        isin: 'US81181C1045',
        lot: 1,
        currency: 'usd',
        klong: 0,
        kshort: 0,
        dlong: 0,
        dshort: 0,
        dlong_min: 0,
        dshort_min: 0,
        short_enabled_flag: false,
        name: 'Seagen Inc.',
        exchange: 'SPB',
        ipo_date: {
          seconds: '983836800',
          nanos: 0,
        },
        issue_size: '10000000',
        country_of_risk: 'US',
        country_of_risk_name: 'Соединенные Штаты Америки',
        sector: 'health_care',
        issue_size_plan: '0',
        nominal: {
          currency: 'usd',
          units: '0',
          nano: 1000000,
        },
        trading_status: 'SECURITY_TRADING_STATUS_NORMAL_TRADING',
        otc_flag: false,
        buy_available_flag: true,
        sell_available_flag: true,
        div_yield_flag: false,
        share_type: 'SHARE_TYPE_COMMON',
        min_price_increment: 0.009999999776482582,
        api_trade_available_flag: true,
      },
      {
        figi: 'BBG004MN1R41',
        ticker: 'NAVI',
        class_code: 'SPBXM',
        isin: 'US63938C1080',
        lot: 1,
        currency: 'usd',
        klong: 0,
        kshort: 0,
        dlong: 0,
        dshort: 0,
        dlong_min: 0,
        dshort_min: 0,
        short_enabled_flag: false,
        name: 'Navient',
        exchange: 'SPB',
        ipo_date: null,
        issue_size: '263012203',
        country_of_risk: 'US',
        country_of_risk_name: 'Соединенные Штаты Америки',
        sector: 'financial',
        issue_size_plan: '1125000000',
        nominal: {
          currency: 'usd',
          units: '0',
          nano: 10000000,
        },
        trading_status: 'SECURITY_TRADING_STATUS_NORMAL_TRADING',
        otc_flag: false,
        buy_available_flag: true,
        sell_available_flag: true,
        div_yield_flag: true,
        share_type: 'SHARE_TYPE_COMMON',
        min_price_increment: 0.009999999776482582,
        api_trade_available_flag: true,
      },
    ];
    return { heroes };
  }

  // Overrides the genId method to ensure that a hero always has an id.
  // If the heroes array is empty,
  // the method below returns the initial number (11).
  // if the heroes array is not empty, the method below returns the highest
  // hero id + 1.
  genId(heroes: Hero[]): number {
    return heroes.length > 0
      ? Math.max(...heroes.map((hero) => hero.id)) + 1
      : 11;
  }
}

/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at https://angular.io/license
*/
