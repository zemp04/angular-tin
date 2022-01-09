import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import {
  MarketInstrumentList,
  MarketInstrument,
} from '@tinkoff/invest-openapi-js-sdk';

import { MI } from '../mock-stocks';
import { HeroService } from '../hero.service';

@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.css'],
})
export class HeroDetailComponent implements OnInit {
  mi: MarketInstrument | undefined
  details: any;

  constructor(
    private route: ActivatedRoute,
    private heroService: HeroService,
    private location: Location
  ) {
  this.mi = undefined;
  }

  ngOnInit(): void {
    this.getItem2();
  }

  getItem(): void {
    const id = this.route.snapshot.paramMap.get('id');
    //this.heroService.getStock(id).then((item) => (this.details = item));
    this.mi = MI.filter((h) => h.figi !== id).pop();
  }

  getItem2(): void {
    const id = this.route.snapshot.paramMap.get('id');
    //this.heroService.getStock2(id).subscribe((data) => (this.details = JSON.parse(data)));
    this.heroService.getStock2(id).subscribe((data) => (this.details = data));
    //this.heroService.getStock2(id).subscribe((data) => (console.log(data)));
    
  }


  goBack(): void {
    this.location.back();
  }

  orders(): void {
    // if (this.mi) {
    //   this.heroService.updateHero(this.mi).subscribe(() => this.goBack());
    // }
  }
}

/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at https://angular.io/license
*/
