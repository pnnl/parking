"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
function deepFreeze(object) {
    var propNames = Reflect.ownKeys(object);
    for (var _i = 0, propNames_1 = propNames; _i < propNames_1.length; _i++) {
        var name_1 = propNames_1[_i];
        var value = object[name_1];
        if (value && typeof value === "object") {
            deepFreeze(value);
        }
    }
    return Object.freeze(object);
}
var Base = /** @class */ (function () {
    function Base(values, decorator) {
        var _this = this;
        this._matcher = function (v) { return v; };
        this.parse = function (value) {
            var parsed = undefined;
            if ((0, lodash_1.isNumber)(value)) {
                parsed = _this._values[value];
            }
            else if ((0, lodash_1.has)(value, ["name"])) {
                parsed = _this.parse(value.name);
            }
            else if ((0, lodash_1.isString)(value)) {
                parsed = _this._constants[value];
                if (!parsed) {
                    var t_1 = _this._matcher(value);
                    parsed = _this._values.find(function (v) { return _this._keys.map(function (k) { return _this._matcher(v[k]); }).includes(t_1); });
                }
            }
            return parsed;
        };
        this.parseStrict = function (value) {
            var parsed = _this.parse(value);
            if (!parsed) {
                throw new Error("Unknown constant for ".concat(value, "."));
            }
            return parsed;
        };
        if (!(values === null || values === void 0 ? void 0 : values.length)) {
            throw new Error("Values with at least one item must be specified.");
        }
        this._values = values.map(function (v) { return deepFreeze(decorator ? decorator(_this, v) : v); });
        this._constants = values.reduce(function (p, c) {
            var _a, _b;
            return (0, lodash_1.merge)(p, (0, lodash_1.merge)((_a = {}, _a[c.name] = c, _a), (_b = {}, _b[c.label] = c, _b)));
        }, {});
        this._keys = Object.keys(values[0]).filter(function (k) { return (0, lodash_1.isString)(values[0][k]); });
    }
    Object.defineProperty(Base.prototype, "matcher", {
        /**
         * Process all values using this function when matching them.
         */
        get: function () {
            return this._matcher;
        },
        /**
         * Process all values using this function when matching them.
         */
        set: function (matcher) {
            this._matcher = matcher;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Base.prototype, "values", {
        /**
         * Get a list of the values.
         */
        get: function () {
            return this._values;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Base.prototype, "constants", {
        /**
         * Get a map of the value names and labels.
         */
        get: function () {
            return this._constants;
        },
        enumerable: false,
        configurable: true
    });
    return Base;
}());
exports.default = Base;
