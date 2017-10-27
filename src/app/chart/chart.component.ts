import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, Input } from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('chart') public chartEl: ElementRef;
  @Input() title: string;
  @Input() options: object;


  private _chart: any;

  constructor() {
    const me = this;

    setInterval(function () {
      if (me._chart) {
        me._chart['series'][0].addPoint([(new Date()).getTime(), me.randomValue()], true, true);
      }
    }, 2000);
  }

  ngOnInit() {
  }

  private randomValue() {
    return Math.floor(Math.random() * 10) + 0;
  }

  public ngAfterViewInit() {
    const opts: any = {
        xAxis: {
          type: 'datetime',
          tickPixelInterval: 150
        },
        series: [{
          name: 'Random data',
          data: (function () {
              const data = [], time = (new Date()).getTime();

              for (let i = -19; i <= 0; i += 1) {
                  data.push({
                      x: time + i * 1000,
                      y: Math.floor(Math.random() * 10) + 0
                  });
              }
              return data;
          }())
        }]
    };

    if (this.chartEl && this.chartEl.nativeElement) {
        opts.chart = {
            type: 'spline',
            renderTo: this.chartEl.nativeElement
        };
        this._chart = new Highcharts.Chart(opts);
    }
  }

  ngOnDestroy(): void {
    this._chart.destroy();
  }

}
