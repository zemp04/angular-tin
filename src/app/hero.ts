export interface Hero {
  id: number;
  name: string;
  figi: string; //"BBG000BC7VW9"
  ticker: string; //"MYRG",
  class_code: string; //"SPBXM",
  isin: string; //"US55405W1045",
  lot: number;
  currency: string; //"usd",
  exchange: string; //"SPB",
  // ipo_date: date; //null,
  issue_size: string; //"16610032",
  country_of_risk: string; //"US",
  country_of_risk_name: string; //"Соединенные Штаты Америки",
  sector: string; //"green_buildings",
  issue_size_plan: string; //"100000000"
  nominal: {
    currency: string; //"usd",
    units: string; //"0",
    nano: string; //10000000
  };
}

/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at https://angular.io/license
*/
