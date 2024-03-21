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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var base_1 = __importDefault(require("./base"));
var lodash_1 = require("lodash");
var parking_1 = __importDefault(require("./parking"));
var Vehicle = /** @class */ (function (_super) {
    __extends(Vehicle, _super);
    function Vehicle() {
        var _this = _super.call(this, [
            {
                name: "passenger",
                label: "Passenger",
                allows: [],
            },
            {
                name: "commercial",
                label: "Commercial",
                allows: [],
            },
            {
                name: "delivery",
                label: "Delivery",
                allows: [],
            },
            {
                name: "transport",
                label: "Transport",
                allows: [],
            },
            {
                name: "emergency",
                label: "Emergency",
                allows: [],
            },
        ].map(function (r) { return (__assign(__assign({}, r), { allowed: (function (_v) {
                throw new Error("Vehicle allowed functon not implemented.");
            }) })); }), function (t, r) { return (0, lodash_1.merge)(r, { allowed: (function () {
                var _a;
                var v = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    v[_i] = arguments[_i];
                }
                return (_a = t).allowed.apply(_a, __spreadArray([r], v, false));
            }) }); }) || this;
        // static references to objects
        _this.Passenger = _this.parseStrict("passenger");
        _this.Commercial = _this.parseStrict("commercial");
        _this.Delivery = _this.parseStrict("delivery");
        _this.Transport = _this.parseStrict("transport");
        _this.Emergency = _this.parseStrict("emergency");
        /**
         * Determines if the vehicle is allowed to park in any of the type(s).
         *
         * @param a
         * @param b
         * @returns true if allowed
         */
        _this.allowed = function (a) {
            var b = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                b[_i - 1] = arguments[_i];
            }
            var vehicle = _this.parseStrict(a);
            var parkings = b.map(function (v) { return parking_1.default.parse(v); }).filter(function (v) { return v; });
            var allowed = parkings.filter(function (p) { var _a; return (p === null || p === void 0 ? void 0 : p.allows.includes(vehicle === null || vehicle === void 0 ? void 0 : vehicle.name)) || vehicle.allows.includes((_a = p === null || p === void 0 ? void 0 : p.name) !== null && _a !== void 0 ? _a : ""); });
            return allowed.length > 0;
        };
        return _this;
    }
    return Vehicle;
}(base_1.default));
var vehicle = new Vehicle();
exports.default = vehicle;
