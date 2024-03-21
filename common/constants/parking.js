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
var vehicle_1 = __importDefault(require("./vehicle"));
var Parking = /** @class */ (function (_super) {
    __extends(Parking, _super);
    function Parking() {
        var _this = _super.call(this, [
            {
                name: "PAID",
                label: "Paid Parking",
                allows: ["passenger", "emergency"],
            },
            {
                name: "CV",
                label: "Commercial Vehicle",
                allows: ["commercial", "emergency"],
            },
            { name: "Bus", label: "Bus", allows: ["transport", "emergency"] },
            { name: "ALLEY", label: "ALLEY", allows: ["delivery", "emergency"] },
            {
                name: "BA",
                label: "BARRIER AREA",
                allows: ["emergency"],
            },
            { name: "BIKE", label: "BIKE ZONE", allows: [] },
            { name: "BUS", label: "BUS ZONE", allows: ["transport", "emergency"] },
            {
                name: "BUSLAY",
                label: "BUS LAYOVER ZONE",
                allows: ["transport", "emergency"],
            },
            {
                name: "CHRTR",
                label: "CHARTER BUS ZONE",
                allows: ["transport", "emergency"],
            },
            { name: "CLR", label: "CLEARANCE", allows: ["emergency"] },
            { name: "CR", label: "CURB RAMP", allows: ["passenger", "commercial", "delivery", "transport", "emergency"] },
            {
                name: "CRBBLB",
                label: "CURB BULB",
                allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
            },
            {
                name: "CRPL",
                label: "CARPOOL PARKING - FULL TIME",
                allows: ["passenger", "transport", "emergency"],
            },
            {
                name: "CS",
                label: "CARSHARE/FLEXCAR",
                allows: ["passenger", "transport", "emergency"],
            },
            {
                name: "CV-TAX",
                label: "CVLZ - TAXI",
                allows: ["transport", "emergency"],
            },
            {
                name: "CVLZ",
                label: "COMMERCIAL VEHICLE LOAD ZONE",
                allows: ["commercial", "delivery", "emergency"],
            },
            {
                name: "CVLZ",
                label: "Commercial vehicle loading zone",
                allows: ["commercial", "delivery", "emergency"],
            },
            {
                name: "CVLZ-B",
                label: "CVLZ - BUS ZONE",
                allows: ["transport", "emergency"],
            },
            {
                name: "CVLZ-P",
                label: "CVLZ - PLZ",
                allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
            },
            {
                name: "CVLZ-TRUCK",
                label: "CVLZ - TRUCK LOAD ONLY",
                allows: ["commercial", "emergency"],
            },
            {
                name: "CVLZS",
                label: "CVLZ - SIGN ONLY",
                allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
            },
            {
                name: "CZ",
                label: "CONSULATE ZONE",
                allows: ["delivery", "transport", "emergency"],
            },
            {
                name: "DISABL",
                label: "DISABLED ZONE",
                allows: ["passenger", "emergency"],
            },
            { name: "DW", label: "DRIVEWAY", allows: ["passenger"] },
            { name: "HYD", label: "HYDRANT", allows: ["emergency"] },
            {
                name: "L/UL",
                label: "LOAD/UNLOAD ZONE",
                allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
            },
            {
                name: "LEVO",
                label: "LAW ENFORCEMENT VEHICLES ONLY",
                allows: ["emergency"],
            },
            {
                name: "LOAD",
                label: "Passenger loading zone",
                allows: ["passenger", "transport", "emergency"],
            },
            { name: "NP", label: "NO PARKING", allows: ["emergency"] },
            {
                name: "OTHERN",
                label: "OTHER SPACE TYPE - NO PARKING",
                allows: ["emergency"],
            },
            {
                name: "OTHERP",
                label: "OTHER SPACE TYPE - YES PARKING",
                allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
            },
            {
                name: "PARKLET",
                label: "PARKLET",
                allows: ["passenger", "emergency"],
            },
            {
                name: "PLZ",
                label: "PASSENGER LOAD ZONE",
                allows: ["passenger", "transport", "emergency"],
            },
            {
                name: "PLZ-VEND",
                label: "PASSENGER LOAD ZONE - VENDING ZONE",
                allows: ["passenger", "transport", "emergency"],
            },
            { name: "PS", label: "PAY STATION", allows: ["passenger", "transport", "emergency"] },
            {
                name: "PS-BUS",
                label: "PAY STATION - BUS ZONE",
                allows: ["transport", "emergency"],
            },
            {
                name: "PS-CAR",
                label: "PAY STATION - CARPOOL",
                allows: ["passenger", "transport", "emergency"],
            },
            {
                name: "PS-CVLZ",
                label: "PAY STATION - CVLZ",
                allows: ["commercial", "delivery", "transport", "emergency"],
            },
            {
                name: "PS-DIS",
                label: "PAY STATION - DISABLED",
                allows: ["passenger", "emergency"],
            },
            {
                name: "PS-LAY",
                label: "PAY STATION - BUS LAYOVER",
                allows: ["transport", "emergency"],
            },
            {
                name: "PS-LEV",
                label: "PAY STATION - LEVO",
                allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
            },
            {
                name: "PS-LUL",
                label: "PAY STATION - LOAD/UNLOAD ZONE",
                allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
            },
            {
                name: "PS-MC",
                label: "PAY STATION - MOTORCYCLE",
                allows: ["passenger", "emergency"],
            },
            {
                name: "PS-PLZ",
                label: "PAY STATION - PLZ",
                allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
            },
            {
                name: "PS-RPZ",
                label: "PAY STATION - RES PARKING ZONE",
                allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
            },
            {
                name: "PS-SBO",
                label: "PAY STATION - SHUTTLE BUS ONLY",
                allows: ["transport", "emergency"],
            },
            {
                name: "PS-SCH",
                label: "PAY STATION - SCHOOL",
                allows: ["passenger", "transport", "emergency"],
            },
            {
                name: "PS-TAX",
                label: "PAY STATION - TAXI",
                allows: ["transport", "emergency"],
            },
            {
                name: "PS-TR",
                label: "PAY STATION - TEMP REMOVAL",
                allows: [],
            },
            {
                name: "PS-TRK",
                label: "PAY STATION - TRUCK L/U ZONE",
                allows: ["commercial", "delivery", "transport", "emergency"],
            },
            {
                name: "PS-VEN",
                label: "PAY STATION - VENDOR",
                allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
            },
            {
                name: "SBO",
                label: "SHUTTLE BUS ONLY",
                allows: ["transport", "emergency"],
            },
            {
                name: "SFD",
                label: "SEATTLE FIRE DEPT ZONE",
                allows: ["emergency"],
            },
            { name: "TAXI", label: "TAXI ZONE", allows: ["transport", "emergency"] },
            {
                name: "TAZ",
                label: "TOW AWAY ZONE",
                allows: [],
            },
            { name: "TL", label: "TIME LIMIT", allows: ["passenger", "commercial", "delivery", "transport", "emergency"] },
            {
                name: "TL-LAY",
                label: "TIME LIMIT - BUS LAYOVER",
                allows: ["transport", "emergency"],
            },
            {
                name: "TL-LUL",
                label: "TIME LIMIT - LOAD/UNLOAD ZONE",
                allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
            },
            {
                name: "TL-PKP",
                label: "TIME LIMIT - PEAK PM",
                allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
            },
            {
                name: "TL-PLZ",
                label: "TIME LIMIT - PLZ",
                allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
            },
            {
                name: "TL-RPZ",
                label: "TIME LIMIT - RES PARKING ZONE",
                allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
            },
            {
                name: "TL-TR",
                label: "TIME LIMIT - TEMP REMOVAL",
                allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
            },
            {
                name: "TL-TRK",
                label: "TIME LIMIT - TRUCK L/U ZONE",
                allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
            },
            {
                name: "TRUCK",
                label: "TRUCK LOAD/UNLOAD ZONE",
                allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
            },
            {
                name: "UNR",
                label: "UNRESTRICTED",
                allows: ["passenger", "commercial", "delivery", "transport", "emergency"],
            },
            { name: "XW", label: "CROSSWALK", allows: [] },
            {
                name: "XWAREA",
                label: "NOT A DESIGNATED CROSSWALK",
                allows: [],
            },
        ].map(function (r) { return (__assign(__assign({}, r), { allowed: (function (_v) {
                throw new Error("Parking allowed functon not implemented.");
            }) })); }), function (t, r) { return (0, lodash_1.merge)(r, { allowed: (function () {
                var _a;
                var v = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    v[_i] = arguments[_i];
                }
                return (_a = t).allowed.apply(_a, __spreadArray([r], v, false));
            }) }); }) || this;
        // static references to objects
        _this.PAID = _this.parseStrict("PAID");
        _this.CV = _this.parseStrict("CV");
        _this.Bus = _this.parseStrict("Bus");
        /**
         * Determines if parking is allowed for any of the vehicle(s).
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
            var parking = _this.parseStrict(a);
            var vehicles = b.map(function (v) { return vehicle_1.default.parse(v); }).filter(function (v) { return v; });
            var allowed = vehicles.filter(function (v) { var _a; return (v === null || v === void 0 ? void 0 : v.allows.includes(parking === null || parking === void 0 ? void 0 : parking.name)) || parking.allows.includes((_a = v === null || v === void 0 ? void 0 : v.name) !== null && _a !== void 0 ? _a : ""); });
            return allowed.length > 0;
        };
        return _this;
    }
    return Parking;
}(base_1.default));
var parking = new Parking();
exports.default = parking;
