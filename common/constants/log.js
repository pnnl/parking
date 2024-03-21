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
var Log = /** @class */ (function (_super) {
    __extends(Log, _super);
    function Log() {
        var _this = _super.call(this, [
            {
                name: "banner",
                label: "Banner",
                enum: "Banner",
                level: "0",
            },
            {
                name: "trace",
                label: "Trace",
                enum: "Trace",
                level: "10",
            },
            {
                name: "debug",
                label: "Debug",
                enum: "Debug",
                level: "20",
            },
            {
                name: "info",
                label: "Info",
                enum: "Info",
                level: "30",
            },
            {
                name: "warn",
                label: "Warn",
                enum: "Warn",
                level: "40",
            },
            {
                name: "error",
                label: "Error",
                enum: "Error",
                level: "50",
            },
            {
                name: "fatal",
                label: "Fatal",
                enum: "Fatal",
                level: "60",
            },
        ]) || this;
        // static references to objects
        _this.Banner = _this.parseStrict("banner");
        _this.BannerType = _this.parseStrict("banner");
        _this.Trace = _this.parseStrict("trace");
        _this.TraceType = _this.parseStrict("trace");
        _this.Debug = _this.parseStrict("debug");
        _this.DebugType = _this.parseStrict("debug");
        _this.Info = _this.parseStrict("info");
        _this.InfoType = _this.parseStrict("info");
        _this.Warn = _this.parseStrict("warn");
        _this.WarnType = _this.parseStrict("warn");
        _this.Error = _this.parseStrict("error");
        _this.ErrorType = _this.parseStrict("error");
        _this.Fatal = _this.parseStrict("fatal");
        _this.FatalType = _this.parseStrict("fatal");
        return _this;
    }
    return Log;
}(base_1.default));
var log = new Log();
exports.default = log;
