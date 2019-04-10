import BigNumber from "bignumber.js";

export class Data {

    constructor(private _type: string, private _value: BigNumber, private _timestamp: BigNumber) {}

    public getType(): string {
        return this._type;
    }

    public getValue(): number {
        return this._value.div(100).toNumber();
    }

    public getTimestamp(): Date {
        return new Date(this._timestamp.toNumber());
    }

    public getTimestampAsNumber(): number {
        return this._timestamp.toNumber();
    }

}
