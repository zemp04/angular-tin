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
        currency: 'usd',
      },
      {
        figi: 'BBG002293PJ4',
        ticker: 'RH',
        class_code: 'SPBXM',
        isin: 'US74967X1037',
        currency: 'usd',
      },
      {
        figi: 'BBG000BH0FR6',
        ticker: 'SGEN',
        class_code: 'SPBXM',
        isin: 'US81181C1045',
        currency: 'usd',
      },
      {
        figi: 'BBG004MN1R41',
        ticker: 'NAVI',
        class_code: 'SPBXM',
        isin: 'US63938C1080',
        currency: 'usd',
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
