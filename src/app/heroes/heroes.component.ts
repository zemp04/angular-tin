import { Component, OnInit } from '@angular/core';

import { Hero } from '../hero';
import { HeroService } from '../hero.service';
import { MarketInstrumentList } from '@tinkoff/invest-openapi-js-sdk';

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.css'],
})
export class HeroesComponent implements OnInit {
  stocks: MarketInstrumentList[] = [];

  constructor(private heroService: HeroService) {}

  ngOnInit(): void {
    this.getHeroes();
  }

  getHeroes(): void {
    this.heroService.getHeroes().then((st) => (this.stocks = st));
  }

  add(name: string): void {
    name = name.trim();
    if (!name) {
      return;
    }
    // this.heroService.addHero({ name } as Hero).then((hero) => {
    //   this.heroes.push(hero);
    // });
  }

  delete(hero: Hero): void {
    //  this.heroes = this.heroes.filter((h) => h !== hero);
    //  this.heroService.deleteHero(hero.id).subscribe();
  }
}

/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at https://angular.io/license
*/
