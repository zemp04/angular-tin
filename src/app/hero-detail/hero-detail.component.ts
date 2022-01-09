import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import {
  MarketInstrumentList,
  MarketInstrument,
} from '@tinkoff/invest-openapi-js-sdk';


import { HeroService } from '../hero.service';

@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.css'],
})
export class HeroDetailComponent implements OnInit {
  mi: MarketInstrument | null;

  constructor(
    private route: ActivatedRoute,
    private heroService: HeroService,
    private location: Location
  ) {
  this.mi = null;
  }

  ngOnInit(): void {
    this.getItem();
  }

  getItem(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.heroService.getStock(id).then((item) => (this.mi = item));
  }

  goBack(): void {
    this.location.back();
  }

  orders(): void {
    // if (this.hero) {
    //   this.heroService.updateHero(this.mi).subscribe(() => this.goBack());
    // }
  }
}

/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at https://angular.io/license
*/
