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
var types_1 = require("../types");
var lodash_1 = require("lodash");
var base_1 = __importDefault(require("./base"));
var Role = /** @class */ (function (_super) {
    __extends(Role, _super);
    function Role() {
        var _this = _super.call(this, [
            {
                name: "admin",
                label: "Admin",
                grants: ["user"],
                enum: types_1.RoleEnum.Admin,
            },
            {
                name: "user",
                label: "User",
                grants: [],
                enum: types_1.RoleEnum.User,
            },
        ].map(function (r) { return (__assign(__assign({}, r), { granted: (function (_v) {
                throw new Error("Role granted functon not implemented.");
            }) })); }), function (t, r) { return (0, lodash_1.merge)(r, { granted: (function () {
                var _a;
                var v = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    v[_i] = arguments[_i];
                }
                return (_a = t).granted.apply(_a, __spreadArray([r], v, false));
            }) }); }) || this;
        // static references to objects
        _this.Admin = _this.parseStrict("admin");
        _this.AdminType = _this.parseStrict("admin");
        _this.User = _this.parseStrict("user");
        _this.UserType = _this.parseStrict("user");
        /**
         * Determines if the a role is granted by the b role(s).
         * I.e. Is the role lead granted to roles user and status?
         * Written as: `role.granted("lead", "user", "status") === false`
         */
        _this.granted = function (a) {
            var _a;
            var b = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                b[_i - 1] = arguments[_i];
            }
            var name = (_a = _this.parse(a)) === null || _a === void 0 ? void 0 : _a.name;
            var roles = b.map(function (v) { var _a; return (_a = _this.parse(v)) === null || _a === void 0 ? void 0 : _a.name; }).filter(function (v) { return v; });
            var granted = _this.values.filter(function (v) { return v.name === name || v.grants.includes(name !== null && name !== void 0 ? name : ""); }).map(function (v) { return v.name; });
            return (0, lodash_1.intersection)(roles, granted).length > 0;
        };
        return _this;
    }
    return Role;
}(base_1.default));
var role = new Role();
exports.default = role;
