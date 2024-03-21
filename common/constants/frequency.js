"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var base_1 = __importDefault(require("./base"));
var Frequency = /** @class */ (function (_super) {
    __extends(Frequency, _super);
    function Frequency() {
        var _this = _super.call(this, [
            {
                name: "second",
                label: "Second",
                abbr: "s",
                plural: "seconds",
                pattern: {
                    postgres: "YYYY-MM-DD HH24:mm:ss",
                    mysql: "%Y-%m-%d %H:%i:%s",
                },
            },
            {
                name: "minute",
                label: "Minute",
                abbr: "m",
                plural: "minutes",
                pattern: {
                    postgres: "YYYY-MM-DD HH24:mm",
                    mysql: "%Y-%m-%d %H:%i",
                },
            },
            {
                name: "hour",
                label: "Hour",
                abbr: "h",
                plural: "hours",
                pattern: {
                    postgres: "YYYY-MM-DD HH24",
                    mysql: "%Y-%m-%d %H",
                },
            },
            {
                name: "day",
                label: "Day",
                abbr: "d",
                plural: "days",
                pattern: {
                    postgres: "YYYY-MM-DD",
                    mysql: "%Y-%m-%d",
                },
            },
        ]) || this;
        // static references to objects
        _this.Second = _this.parseStrict("second");
        _this.SecondType = _this.parseStrict("second");
        _this.Minute = _this.parseStrict("minute");
        _this.MinuteType = _this.parseStrict("minute");
        _this.Hour = _this.parseStrict("hour");
        _this.HourType = _this.parseStrict("hour");
        _this.Day = _this.parseStrict("day");
        _this.DayType = _this.parseStrict("day");
        return _this;
    }
    return Frequency;
}(base_1.default));
var frequency = new Frequency();
frequency.matcher = function (v) {
    switch (v) {
        case "s":
        case "S":
            return "second";
        case "m":
        case "M":
            return "minute";
        case "h":
        case "H":
            return "hour";
        case "d":
        case "D":
            return "day";
        default:
            return v;
    }
};
exports.default = frequency;
