import { Component, OnInit } from '@angular/core';
import { HeroService } from '../hero.service';
import {
  MarketInstrumentList,
  MarketInstrument,
} from '@tinkoff/invest-openapi-js-sdk';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  mis: MarketInstrument[] = [];
  alltypes: string[] = ['Bounds', 'ETF', 'Shares', 'Currency', 'Orders'];

  constructor(private heroService: HeroService) {}

  ngOnInit(): void {
    this.getHeroes();
  }

  getHeroes(): void {
    this.heroService
      .getStocks()
      .then((heroes) => (this.mis = heroes.slice(1, 5)));
  }
}

/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at https://angular.io/license
*/
