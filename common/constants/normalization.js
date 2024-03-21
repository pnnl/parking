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
var lodash_1 = require("lodash");
var base_1 = __importDefault(require("./base"));
var xregexp_1 = __importDefault(require("xregexp"));
var processLettersAndNumbers = function (v) {
    return (0, lodash_1.isNil)(v) ? "" : xregexp_1.default.replace(v, (0, xregexp_1.default)("[^\\s\\p{L}0-9]", "gm"), "");
};
var Normalization = /** @class */ (function (_super) {
    __extends(Normalization, _super);
    function Normalization() {
        var _this = _super.call(this, [
            {
                name: "NFD",
                label: "NFD",
                unallowed: ["NFC", "NFKD", "NFKC"],
                process: (function (v) { return ((0, lodash_1.isNil)(v) ? "" : v.normalize("NFD")); }),
            },
            {
                name: "NFC",
                label: "NFC",
                unallowed: ["NFD", "NFKD", "NFKC"],
                process: (function (v) { return ((0, lodash_1.isNil)(v) ? "" : v.normalize("NFC")); }),
            },
            {
                name: "NFKD",
                label: "NFKD",
                unallowed: ["NFD", "NFC", "NFKC"],
                process: (function (v) { return ((0, lodash_1.isNil)(v) ? "" : v.normalize("NFKD")); }),
            },
            {
                name: "NFKC",
                label: "NFKC",
                unallowed: ["NFD", "NFC", "NFKD"],
                process: (function (v) { return ((0, lodash_1.isNil)(v) ? "" : v.normalize("NFKC")); }),
            },
            {
                name: "LOWERCASE",
                label: "Lowercase",
                unallowed: ["UPPERCASE"],
                process: (function (v) { return ((0, lodash_1.isNil)(v) ? "" : v.toLowerCase()); }),
            },
            {
                name: "UPPERCASE",
                label: "Uppercase",
                unallowed: ["LOWERCASE"],
                process: (function (v) { return ((0, lodash_1.isNil)(v) ? "" : v.toUpperCase()); }),
            },
            {
                name: "LETTERS",
                label: "Letters",
                unallowed: [],
                process: (function (v) { return ((0, lodash_1.isNil)(v) ? "" : xregexp_1.default.replace(v, (0, xregexp_1.default)("[^\\s\\p{L}]", "gm"), "")); }),
            },
            {
                name: "NUMBERS",
                label: "Numbers",
                unallowed: [],
                process: (function (v) { return ((0, lodash_1.isNil)(v) ? "" : xregexp_1.default.replace(v, /[^\s0-9]/gm, "")); }),
            },
            {
                name: "TRIM",
                label: "Trim",
                unallowed: ["CONCATENATE"],
                process: (function (v) { return ((0, lodash_1.isNil)(v) ? "" : v.trim()); }),
            },
            {
                name: "COMPACT",
                label: "Compact",
                unallowed: ["CONCATENATE"],
                process: (function (v) { return ((0, lodash_1.isNil)(v) ? "" : xregexp_1.default.replace(v, /\s+/gm, " ")); }),
            },
            {
                name: "CONCATENATE",
                label: "Concatenate",
                unallowed: ["TRIM", "COMPACT"],
                process: (function (v) { return ((0, lodash_1.isNil)(v) ? "" : xregexp_1.default.replace(v, /\s+/gm, "")); }),
            },
        ].map(function (r) { return (__assign(__assign({}, r), { allowed: (function (_v) {
                throw new Error("Normalization allowed functon not implemented.");
            }) })); }), function (t, r) {
            return (0, lodash_1.merge)(r, {
                allowed: (r.unallowed.length === 0
                    ? function (_v) { return true; }
                    : function () {
                        var _a;
                        var v = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            v[_i] = arguments[_i];
                        }
                        return (_a = t).allowed.apply(_a, __spreadArray([r], v, false));
                    }),
            });
        }) || this;
        // static references to objects
        _this.NFD = _this.parseStrict("NFD");
        _this.NFDType = _this.parseStrict("NFD");
        _this.NFC = _this.parseStrict("NFC");
        _this.NFCType = _this.parseStrict("NFC");
        _this.NFKD = _this.parseStrict("NFKD");
        _this.NFKDType = _this.parseStrict("NFKD");
        _this.NFKC = _this.parseStrict("NFKC");
        _this.NFKCType = _this.parseStrict("NFKC");
        _this.Lowercase = _this.parseStrict("Lowercase");
        _this.LowercaseType = _this.parseStrict("Lowercase");
        _this.Uppercase = _this.parseStrict("Uppercase");
        _this.UppercaseType = _this.parseStrict("Uppercase");
        _this.Letters = _this.parseStrict("Letters");
        _this.LettersType = _this.parseStrict("Letters");
        _this.Numbers = _this.parseStrict("Numbers");
        _this.NumbersType = _this.parseStrict("Numbers");
        _this.Trim = _this.parseStrict("Trim");
        _this.TrimType = _this.parseStrict("Trim");
        _this.Compact = _this.parseStrict("Compact");
        _this.CompactType = _this.parseStrict("Compact");
        _this.Concatenate = _this.parseStrict("Concatenate");
        _this.ConcatenateType = _this.parseStrict("Concatenate");
        /**
         * Determines if the a normalization is allowed by the b normalization(s).
         */
        _this.allowed = function (a) {
            var _a, _b;
            var b = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                b[_i - 1] = arguments[_i];
            }
            var normalizations = b.map(function (v) { var _a; return (_a = _this.parse(v)) === null || _a === void 0 ? void 0 : _a.name; }).filter(function (v) { return v; });
            var allowed = (_b = (_a = _this.parse(a)) === null || _a === void 0 ? void 0 : _a.unallowed) !== null && _b !== void 0 ? _b : [];
            return (0, lodash_1.isEmpty)((0, lodash_1.intersection)(normalizations, allowed));
        };
        /**
         * Create a normalization function for the specified normalization types.
         */
        _this.process = function () {
            var types = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                types[_i] = arguments[_i];
            }
            var joined = types.map(function (t) { return (0, lodash_1.get)(t, ["label"], t); }).join("|");
            var normalize = (0, lodash_1.intersectionWith)(_this.values, joined.split(/[^a-zA-Z']+/).map(function (s) { return _this.parse(s); }), function (a, b) { return (a === null || a === void 0 ? void 0 : a.name) === (b === null || b === void 0 ? void 0 : b.name); });
            return function (value) {
                return normalize.reduce(function (p, n, i, a) {
                    if ((n.name === "LETTERS" && (0, lodash_1.get)(a, [i + 1, "name"]) === "NUMBERS") ||
                        (n.name === "NUMBERS" && (0, lodash_1.get)(a, [i - 1, "name"]) === "LETTERS")) {
                        return processLettersAndNumbers(p);
                    }
                    return n.process(p);
                }, value);
            };
        };
        return _this;
    }
    return Normalization;
}(base_1.default));
var normalization = new Normalization();
exports.default = normalization;
