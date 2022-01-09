import { Component, OnInit } from '@angular/core';

import { HeroService } from '../hero.service';
import { MI } from '../mock-stocks';
import {
  MarketInstrumentList,
  MarketInstrument,
} from '@tinkoff/invest-openapi-js-sdk';


@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.css'],
})
export class HeroesComponent implements OnInit {
  stocks: MarketInstrumentList;
  myStorage: any;
  private favorites: MarketInstrument[];

  constructor(private heroService: HeroService) {
    this.stocks = {} as MarketInstrumentList;
    this.myStorage = window.localStorage;
    this.favorites = this.heroService.getFav();
  }

  ngOnInit(): void {
    this.getHeroes();
  }

  getHeroes(): void {
    this.stocks.instruments = MI;
    // this.stocks.instruments = this.heroService.getFav();    
  }

  add(mi: string): void {
    if (!mi) {
      return;
    }
    this.heroService.getStock(mi).then((st) => ( this.favorites.push(st) ));    
    // save it
    this.heroService.saveFav(this.favorites);
  }

  delete(figi: string): void {
    // delete item
    this.favorites = this.favorites.filter((h) => h.figi !== figi);
    // save it
    this.heroService.saveFav(this.favorites);
  }
}

/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at https://angular.io/license
*/
