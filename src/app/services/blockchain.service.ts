import { Injectable, EventEmitter, Output } from '@angular/core';
import { BigNumber } from 'bignumber.js';
import { Data } from '../models/data';
declare let require: any;
const contractAbi = require('../../../contracts/SmartOfficeManager.json').abi;

@Injectable({
  providedIn: 'root'
})
export class BlockchainService {

  @Output() update = new EventEmitter();
  private readonly defaultNodeUrl: string = 'https://ropsten.infura.io/v3/88f2c6909fa348ed85fb0a68bf27fde3';
  private readonly contractAddress: string = '0xf9c8A269295Cc150ba9F5a48AE4da622850504EA';
  private readonly officeAddress: string = '0xfc80e94B52c5281713606f35bA7DeB2bC0ddc87f';
  private readonly deviceAddress: string = '0xb183d1dA224482B5Ea7B01e7220B5397fa1a0f97';
  private web3Instance: any;
  private serviceInterval: any;
  private network: string;

  constructor() {
    this.serviceInterval = setInterval(() => {
      if (!this.Web3) {
        clearInterval(this.serviceInterval);
      }
      this.getNetwork();
    }, 1000);
  }

  private connectToNode() {
    if (typeof window['web3'] != 'undefined') {
      console.log('Local injected web3');
      this.web3 = new this.Web3(window['web3'].currentProvider);
    } else {
      console.log('Remote node');
      this.web3 = new this.Web3(new this.Web3.providers.HttpProvider(this.defaultNodeUrl));
    }
  }

  private getNetwork() {
    this.web3.version.getNetwork((err, res) => {
      if (err) {
        this.update.emit({ network: { error: err } });
      } else {
        if (this.network) {
          if (this.network !== res) {
            this.network = res;
            this.update.emit({ network: { value: this.network } });
          }
        } else {
          this.network = res;
          this.update.emit({ network: { value: this.network } });
        }
      }
    });
  }

  get contract(): any {
    const contract: any = this.web3.eth.contract(contractAbi);
    return contract.at(this.contractAddress);
  }

  get web3(): any {
    if (!this.web3Instance) {
      this.connectToNode();
    }
    return this.web3Instance;
  }

  set web3(web3: any) {
    this.web3Instance = web3;
  }

  get Web3(): any {
    return window['Web3'];
  }

  public getData() {
    this.contract.getDataListSize(this.officeAddress, this.deviceAddress, (err, res) => {
      if (err) {
        this.update.emit({ size: { error: err } });
      } else {
        this.contract.getData(this.officeAddress, this.deviceAddress, res.minus(1).toNumber(), (error, result) => {
          if (error) {
            this.update.emit({ data: { error: error } });
          } else {
            this.update.emit({ data: new Data(result[0], result[1], result[2])});
            this.contract.getData(this.officeAddress, this.deviceAddress, res.minus(2).toNumber(), (error1, result1) => {
              if (error1) {
                this.update.emit({ data: { error: error1 } });
              } else {
                this.update.emit({ data: new Data(result1[0], result1[1], result1[2])});
              }
            });
          }
        });
      }
    });
  }

  public getDataList() {
    this.contract.getDataListSize(this.officeAddress, this.deviceAddress, (err, res) => {
      if (err) {
        this.update.emit({ size: { error: err } });
      } else {
        let size: number = res.toNumber();
        this.update.emit({ dataSize: ( size - 3 ) / 2 });
        for (let i = 3; i < size; i+=2) {
          this.contract.getData(this.officeAddress, this.deviceAddress, i, (error, result) => {
            if (error) {
              this.update.emit({ datalist: { error: error } });
            } else {
              this.contract.getData(this.officeAddress, this.deviceAddress, i + 1, (error1, result1) => {
                if (error1) {
                  this.update.emit({ datalist: { error: error1 } });
                } else {
                  this.update.emit({ dataItem: {
                    celsius: new Data(result[0], result[1], result[2]),
                    humidity: new Data(result1[0], result1[1], result1[2])
                  }});
                }
              });
            }
          });
        }
      }
    });
  }

}
