import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BlockchainService } from './services/blockchain.service';
import { Data } from './models/data';
declare let require: any;

const ModelViewer = require('metamask-logo');
const viewer = ModelViewer({
  pxNotRatio: true,
  width: 50,
  height: 40,
  followMouse: false,
  slowDrift: false
})

@Component({
  selector: 'som-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  private _temperatureCtx: any;
  private _humidityCircleCtx: any;
  private _temperatureHumidityChartCanvas: any;
  private _temperatureHumidityChartCtx: any;
  private _expectingDataSize: number;
  time: Date;
  dataList: Array<any> = new Array<any>();
  @ViewChild('historydataframe') historyDataFrameDiv: ElementRef;
  
  constructor(private _blockchainService: BlockchainService) {}

  private drawTemperatureCircleChart(ctx: any, value: number) {
    ctx.clearRect(0, 0, 320, 320);

    ctx.strokeStyle = '#505050';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(160, 160, 140, 0, Math.PI * 2, true);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#505050';
    ctx.font = '100px "Oswald"';
    ctx.fillText(value, 160, 200);
    ctx.font = '20px sans-serif';
    ctx.fillText('\u2103', 220, 130);
    ctx.font = '20px "Oswald"';
    ctx.fillText("TEMPERATURE", 160, 220);

    let gradient = ctx.createLinearGradient(20, 300, 300, 20);
    gradient.addColorStop("0", "#e74c3c");
    gradient.addColorStop("1.0", "#3498db");
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(160, 160, 140, -Math.PI / 2, value * Math.PI / 20 - Math.PI / 2, false);
    ctx.stroke();
  }

  private drawHumidityCircleChart(ctx: any, value: number) {
    ctx.clearRect(0, 0, 320, 320);

    ctx.strokeStyle = '#505050';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(160, 160, 140, 0, Math.PI * 2, true);
    ctx.stroke();

    ctx.font = '100px "Oswald"';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#505050';
    ctx.fillText(value, 160, 200);
    ctx.font = '20px sans-serif';
    ctx.fillText('%', 220, 130);
    ctx.font = '20px "Oswald"';
    ctx.fillText("HUMIDITY", 160, 220);

    let gradient = ctx.createLinearGradient(20, 300, 300, 20);
    gradient.addColorStop("0", "#3498db");
    gradient.addColorStop("1.0", "#e67e22");
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(160, 160, 140, -Math.PI / 2, value * Math.PI / 50 - Math.PI / 2, false);
    ctx.stroke();
  }

  private drawChart(canvas: any, ctx: any) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let datas: Array<any> = this.getDataList();
    let unit: number = canvas.width / datas.length;

    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(80, 80, 80, 0.1)';
    ctx.font = '80px "Oswald"';
    ctx.fillText("TEMPERATURE HISTORY", canvas.width / 2, canvas.height / 4 + 40);
    ctx.fillText("HUMIDITY HISTORY", canvas.width / 2, canvas.height * 3 / 4 + 40);

    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height / 2);
    gradient.addColorStop("0", "rgba(231, 76, 60, 0.4)");
    gradient.addColorStop("1.0", "rgba(52, 152, 219, 0.4)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    for (let i=0; i<datas.length; i++) {
      let y: number = canvas.height / 2 - datas[i].celsius.getValue() * canvas.height / 2 / 40;
      ctx.lineTo(i * unit, y);
    }
    ctx.lineTo((datas.length - 1) * unit, canvas.height / 2);
    ctx.fill();

    gradient = ctx.createLinearGradient(0, 0, 0, canvas.height / 2);
    gradient.addColorStop("0", "#e74c3c");
    gradient.addColorStop("1.0", "#3498db");
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i=0; i<datas.length; i++) {
      let y: number = canvas.height / 2 - datas[i].celsius.getValue() * canvas.height / 2 / 40;
      if (0 == i) {
        ctx.moveTo(i * unit, y);
      } else {
        ctx.lineTo(i * unit, y);
      }
    }
    ctx.stroke();
    
    gradient = ctx.createLinearGradient(0, canvas.height / 2, 0, canvas.height);
    gradient.addColorStop("1.0", "rgba(52, 152, 219, 0.4)");
    gradient.addColorStop("0", "rgba(230, 126, 34, 0.4)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    for (let i=0; i<datas.length; i++) {
      let y: number = canvas.height / 2 + datas[i].humidity.getValue() * canvas.height / 2 / 100;
      ctx.lineTo(i * unit, y);
    }
    ctx.lineTo((datas.length - 1) * unit, canvas.height / 2);
    ctx.fill();

    gradient = ctx.createLinearGradient(0, canvas.height / 2, 0, canvas.height);
    gradient.addColorStop("1.0", "#3498db");
    gradient.addColorStop("0", "#e67e22");
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i=0; i<datas.length; i++) {
      let y: number = canvas.height / 2 + datas[i].humidity.getValue() * canvas.height / 2 / 100;
      if (0 == i) {
        ctx.moveTo(i * unit, y);
      } else {
        ctx.lineTo(i * unit, y);
      }
    }
    ctx.stroke();
    



    ctx.strokeStyle = '#505050';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(canvas.width, 0);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.stroke();

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    
    ctx.strokeStyle = 'rgb(120, 120, 120)';
    ctx.lineWidth = 1;
    ctx.setLineDash([15, 5]);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 4);
    ctx.lineTo(canvas.width, canvas.height / 4);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, canvas.height * 3 / 4);
    ctx.lineTo(canvas.width, canvas.height * 3 / 4);
    ctx.stroke();
  }

  ngOnInit() {
    let container = document.getElementById('metamask')
    container.appendChild(viewer.container)

    let temperatureCircleCanvas: any = document.getElementById('temperature-circle');
    if (temperatureCircleCanvas.getContext) {
      this._temperatureCtx = temperatureCircleCanvas.getContext('2d');
      this.drawTemperatureCircleChart(this._temperatureCtx, 40);
    }

    let humidityCircleCanvas: any = document.getElementById('humidity-circle');
    if (humidityCircleCanvas.getContext) {
      this._humidityCircleCtx = humidityCircleCanvas.getContext('2d');
      this.drawHumidityCircleChart(this._humidityCircleCtx, 100);
    }

    this._blockchainService.update.subscribe(result => {
      if (result) {
        if (result.data) {
          if (result.data.error) {
            console.log(result.data.error);
          } else {
            const data: Data = result.data;
            if ('celsius' === data.getType()) {
              this.drawTemperatureCircleChart(this._temperatureCtx, data.getValue());
            } else if ('humidity' === data.getType()) {
              this.drawHumidityCircleChart(this._humidityCircleCtx, data.getValue());
            }
            this.time = data.getTimestamp();
          }
        } else if (result.dataSize) {
          this.dataList.length = 0;
          this._temperatureHumidityChartCanvas = document.getElementById('temperature-humidity-chart');
          this._temperatureHumidityChartCanvas.width = this.historyDataFrameDiv.nativeElement.clientWidth;
          this._temperatureHumidityChartCanvas.height = this.historyDataFrameDiv.nativeElement.clientHeight;
          if (this._temperatureHumidityChartCanvas.getContext) {
            this._temperatureHumidityChartCtx = this._temperatureHumidityChartCanvas.getContext('2d');
          }
          this._expectingDataSize = result.dataSize;
        } else if (result.dataItem) {
          this.dataList.push(result.dataItem);
          if (this._expectingDataSize === this.dataList.length) {
            this.drawChart(this._temperatureHumidityChartCanvas, this._temperatureHumidityChartCtx);
          }
        }
      }
    });
    this._blockchainService.getData();
    this._blockchainService.getDataList();
  }

  getDataItems(): Array<any> {
    this.dataList.sort((a: any, b: any) => {
      return b.celsius.getTimestampAsNumber() - a.celsius.getTimestampAsNumber();
    });
    return this.dataList;
  }

  private getDataList(): Array<any> {
    this.dataList.sort((a: any, b: any) => {
      return a.celsius.getTimestampAsNumber() - b.celsius.getTimestampAsNumber();
    });
    return this.dataList;
  }

}
