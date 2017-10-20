module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("lodash");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __webpack_require__(0);
var exceptions_1 = __webpack_require__(2);
var DefineModule = /** @class */ (function () {
    function DefineModule() {
    }
    DefineModule.prototype.define = function (key, value) {
        var _this = this;
        if (typeof key !== 'string') {
            Object.keys(key).forEach(function (k) {
                _this.define(k, key[k]);
            });
        }
        else if (key in this) {
            throw new exceptions_1.RedefineConfigurationError(typeof this, key);
        }
        else {
            this[key] = value;
        }
        return this;
    };
    DefineModule.prototype.extend = function (name, typeName, custom) {
        var obj = this[typeName];
        return this.define(name, lodash_1.merge({}, obj, custom));
    };
    return DefineModule;
}());
exports.DefineModule = DefineModule;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function ValidatorError(message, rule) {
    this.key = 'validator';
    this.message = message || "Invalid value for \"" + rule.type + "\" type";
}
exports.ValidatorError = ValidatorError;
function InvalidAttributeError(type, rule) {
    this.key = 'invalidAttribute';
    this.message = "Invalid " + type + " attribute \"" + rule.type + "\"";
}
exports.InvalidAttributeError = InvalidAttributeError;
function RedefineConfigurationError(klass, name) {
    this.key = 'redefineConfiguration';
    this.message = "You can't redefine the \"" + name + "\" in " + klass + ".";
}
exports.RedefineConfigurationError = RedefineConfigurationError;
function RuleNotFound(name, indexes) {
    this.key = 'ruleNotFound';
    this.message = "Rule \"" + name + "\" not found in indexes";
    this.indexes = indexes;
}
exports.RuleNotFound = RuleNotFound;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function compileTemplate(template, payload) {
    return template.replace(/{(.*?)}/g, function (_, key) {
        var output = payload;
        for (var _i = 0, _a = key.split('.'); _i < _a.length; _i++) {
            var prop = _a[_i];
            output = output[prop];
        }
        return output || '';
    });
}
exports.compileTemplate = compileTemplate;
function calculateDelayToTypeMessage(message) {
    var timePerChar = 40;
    return (message || '').length * timePerChar;
}
exports.calculateDelayToTypeMessage = calculateDelayToTypeMessage;
function isMatchAnswer(answer, option) {
    var sanitizedOption = String(option).toLowerCase();
    var sanitizedAnswer = String(answer).toLowerCase();
    return sanitizedAnswer === sanitizedOption;
}
exports.isMatchAnswer = isMatchAnswer;
function findOptionByAnswer(options, answer) {
    var answers = ensureArray(answer);
    var option = options
        .filter(function (o) {
        return answers.some(function (a) { return isMatchAnswer(a, o.value); }) ||
            answers.some(function (a) { return isMatchAnswer(a, o.label); });
    })[0];
    return option;
}
exports.findOptionByAnswer = findOptionByAnswer;
function ensureArray(arr) {
    if (arr instanceof Array) {
        return arr;
    }
    return [arr];
}
exports.ensureArray = ensureArray;
function identifyAnswersInString(answer, options) {
    return options.filter(function (o) {
        return answer.toLowerCase().indexOf(o.toLowerCase()) >= 0;
    });
}
exports.identifyAnswersInString = identifyAnswersInString;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var bot_1 = __webpack_require__(5);
module.exports = bot_1.YveBot;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var store_1 = __webpack_require__(6);
var controller_1 = __webpack_require__(7);
var actions_1 = __webpack_require__(8);
var types_1 = __webpack_require__(9);
var validators_1 = __webpack_require__(10);
function sanitizeRule(rule) {
    if (typeof rule === 'string') {
        return { message: rule };
    }
    if (['SingleChoice', 'MultipleChoice'].indexOf(rule.type) >= 0) {
        rule.options = (rule.options || []).map(function (o) {
            if (typeof o === 'string') {
                return { value: o };
            }
            return o;
        });
    }
    return rule;
}
var YveBot = /** @class */ (function () {
    function YveBot(rules, customOpts) {
        var DEFAULT_OPTS = {
            enableWaitForSleep: true,
        };
        this.sessionId = 'session';
        this.options = Object.assign({}, DEFAULT_OPTS, customOpts);
        this.rules = rules.map(function (rule) { return sanitizeRule(rule); });
        this.handlers = {};
        this.store = new store_1.Store(this);
        this.controller = new controller_1.Controller(this);
        this.on('error', function (err) { throw err; });
    }
    YveBot.prototype.on = function (evt, fn) {
        var isUniqueType = ['error'].indexOf(evt) >= 0;
        if (!isUniqueType && evt in this.handlers) {
            this.handlers[evt].push(fn);
        }
        else {
            this.handlers[evt] = [fn];
        }
        return this;
    };
    YveBot.prototype.start = function () {
        this.dispatch('start');
        this.controller.run().catch(this.tryCatch.bind(this));
        return this;
    };
    YveBot.prototype.end = function () {
        this.dispatch('end', this.store.output());
        return this;
    };
    YveBot.prototype.talk = function (message, opts) {
        var rule = Object.assign({}, this.options.rule, opts || {});
        this.controller.sendMessage(message, rule);
        return this;
    };
    YveBot.prototype.hear = function (answer) {
        this.controller.receiveMessage(answer).catch(this.tryCatch.bind(this));
        return this;
    };
    YveBot.prototype.dispatch = function (name) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (name in this.handlers) {
            this.handlers[name].forEach(function (fn) { return fn.apply(void 0, args.concat([_this.sessionId])); });
        }
    };
    YveBot.prototype.session = function (id, opts) {
        if (opts === void 0) { opts = {}; }
        this.sessionId = id;
        if (opts.rules) {
            this._rules = this.rules;
            this.rules = opts.rules.map(function (rule) { return sanitizeRule(rule); });
        }
        else {
            this.rules = this._rules || this.rules;
        }
        if (opts.store) {
            this.store.replace(opts.store);
        }
        else {
            this.store.reset();
            this.controller.reindex();
        }
        return this;
    };
    YveBot.prototype.tryCatch = function (err) {
        this.dispatch('error', err);
        this.end();
    };
    return YveBot;
}());
exports.YveBot = YveBot;
YveBot.prototype.types = new types_1.Types;
YveBot.prototype.actions = new actions_1.Actions;
YveBot.prototype.validators = new validators_1.Validators;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __webpack_require__(0);
var Store = /** @class */ (function () {
    function Store(bot) {
        this.bot = bot;
        this.reset();
    }
    Store.prototype.output = function () {
        var output = this.get('output');
        return Object.assign({}, output);
    };
    Store.prototype.set = function (key, value) {
        this.data = lodash_1.set(this.data, key, value);
        this.bot.dispatch('storeChanged', this.data);
    };
    Store.prototype.get = function (key) {
        return key ? lodash_1.get(this.data, key) : this.data;
    };
    Store.prototype.unset = function (key) {
        var data = this.data;
        lodash_1.unset(data, key);
        this.data = data;
        this.bot.dispatch('storeChanged', this.data);
    };
    Store.prototype.reset = function () {
        this.data = {
            currentIdx: 0,
            waitingForAnswer: false,
            output: {},
        };
    };
    Store.prototype.replace = function (data) {
        this.reset();
        this.data = lodash_1.merge({}, this.data, data);
    };
    return Store;
}());
exports.Store = Store;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var exceptions_1 = __webpack_require__(2);
var utils = __webpack_require__(3);
function validateAnswer(bot, rule, answers) {
    var validators = [].concat(rule.validators || [], bot.types[rule.type].validators || []);
    validators.forEach(function (obj) {
        Object.keys(obj).forEach(function (k) {
            var validator = bot.validators[k];
            if (!validator || k === 'warning') {
                return;
            }
            var opts = obj[k];
            var isValid = utils.ensureArray(answers)
                .map(function (answer) { return validator.validate(opts, answer, rule, bot); })
                .every(function (a) { return a === true; });
            if (!isValid) {
                var warning = obj.warning || validator.warning;
                var message = typeof warning === 'function' ? warning(opts) : warning;
                throw new exceptions_1.ValidatorError(message, rule);
            }
        });
    });
}
function compileMessage(bot, message) {
    var output = bot.store.output();
    var indexes = bot.controller.getIndexes();
    var re = /(?!\{)\w+[.]((?:\w+[.])*\w+)(?=\})/g;
    var matches = (message.match(re) || []).map(function (s) { return s.split('.')[0]; });
    Array.from(new Set(matches)).map(function (key) {
        var rule = bot.rules[indexes[key]];
        if (!rule || !rule.options) {
            return;
        }
        var answer = output[key];
        output[key] = (function () {
            // multiple choice
            if (answer instanceof Array) {
                return answer
                    .map(function (a) {
                    var opt = utils.findOptionByAnswer(rule.options, a);
                    opt.toString = function () { return a; };
                    return opt;
                });
            }
            // single choice
            var option = utils.findOptionByAnswer(rule.options, answer);
            option.toString = function () { return answer; };
            return option;
        }());
    });
    return utils.compileTemplate(message, output).trim();
}
function runActions(bot, rule, prop) {
    var _this = this;
    var actions = rule[prop] || [];
    return Promise.all(actions.map(function (action) { return __awaiter(_this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, Promise.all(Object.keys(action).map(function (k) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!(k in bot.actions)) return [3 /*break*/, 2];
                                return [4 /*yield*/, bot.actions[k](action[k], rule, bot)];
                            case 1: return [2 /*return*/, _a.sent()];
                            case 2: return [2 /*return*/, null];
                        }
                    });
                }); }))];
        });
    }); }));
}
function getNextFromRule(rule, answer) {
    if (rule.options && answer) {
        var option = utils.findOptionByAnswer(rule.options, answer);
        if (option && option.next) {
            return option.next;
        }
    }
    if (rule.next) {
        return rule.next;
    }
    return null;
}
function getRuleByIndex(bot, idx) {
    var rule = bot.rules[idx] ? bot.rules[idx] : { exit: true };
    return Object.assign({}, bot.options.rule, rule);
}
var Controller = /** @class */ (function () {
    function Controller(bot) {
        this.bot = bot;
        this.indexes = {};
        this.reindex();
    }
    Controller.prototype.reindex = function () {
        var _this = this;
        var bot = this.bot;
        bot.rules.forEach(function (rule, idx) {
            if (rule.name) {
                _this.indexes[rule.name] = idx;
            }
        });
    };
    Controller.prototype.getIndexes = function () {
        return this.indexes;
    };
    Controller.prototype.run = function (idx) {
        if (idx === void 0) { idx = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var bot, rule;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        bot = this.bot;
                        rule = getRuleByIndex(bot, idx);
                        bot.store.set('currentIdx', idx);
                        if (!(bot.options.enableWaitForSleep && 'sleep' in rule)) return [3 /*break*/, 2];
                        return [4 /*yield*/, bot.actions.timeout(rule.sleep)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, runActions(bot, rule, 'preActions')];
                    case 3:
                        _a.sent();
                        if (!rule.message) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.sendMessage(rule.message, rule)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        if (rule.exit) {
                            bot.end();
                            return [2 /*return*/, this];
                        }
                        // run post-actions
                        return [4 /*yield*/, runActions(bot, rule, 'actions')];
                    case 6:
                        // run post-actions
                        _a.sent();
                        if (!rule.type) {
                            return [2 /*return*/, this.nextRule(rule)];
                        }
                        if (!bot.types[rule.type]) {
                            throw new exceptions_1.InvalidAttributeError('type', rule);
                        }
                        bot.store.set('waitingForAnswer', true);
                        bot.dispatch('hear');
                        return [2 /*return*/, this];
                }
            });
        });
    };
    Controller.prototype.sendMessage = function (message, rule) {
        return __awaiter(this, void 0, void 0, function () {
            var bot, text;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        bot = this.bot;
                        bot.dispatch('typing');
                        if (!(bot.options.enableWaitForSleep && !rule.exit)) return [3 /*break*/, 4];
                        if (!('delay' in rule)) return [3 /*break*/, 2];
                        return [4 /*yield*/, bot.actions.timeout(rule.delay)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, bot.actions.timeout(utils.calculateDelayToTypeMessage(message))];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        text = compileMessage(bot, message);
                        bot.dispatch('talk', text, rule);
                        bot.dispatch('typed');
                        return [2 /*return*/, this];
                }
            });
        });
    };
    Controller.prototype.receiveMessage = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var bot, idx, rule, answer, e_1, e_2, output, replyRule;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        bot = this.bot;
                        idx = bot.store.get('currentIdx');
                        rule = getRuleByIndex(bot, idx);
                        if (!bot.store.get('waitingForAnswer')) {
                            return [2 /*return*/, this];
                        }
                        answer = message;
                        if ('parser' in bot.types[rule.type]) {
                            answer = bot.types[rule.type].parser(answer, rule, bot);
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 2, , 5]);
                        validateAnswer(bot, rule, answer);
                        return [3 /*break*/, 5];
                    case 2:
                        e_1 = _a.sent();
                        if (!(e_1 instanceof exceptions_1.ValidatorError)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.sendMessage(e_1.message, rule)];
                    case 3:
                        _a.sent();
                        bot.dispatch('hear');
                        return [2 /*return*/, this];
                    case 4: throw e_1;
                    case 5:
                        if (!('transform' in bot.types[rule.type])) return [3 /*break*/, 9];
                        _a.label = 6;
                    case 6:
                        _a.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, bot.types[rule.type].transform(answer, rule, bot)];
                    case 7:
                        answer = _a.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        e_2 = _a.sent();
                        bot.dispatch('hear');
                        return [2 /*return*/, this];
                    case 9:
                        bot.store.set('waitingForAnswer', false);
                        output = rule.output || rule.name;
                        if (output) {
                            bot.store.set("output." + output, answer);
                        }
                        if (!rule.replyMessage) return [3 /*break*/, 11];
                        replyRule = Object.assign({}, bot.options.rule);
                        return [4 /*yield*/, this.sendMessage(rule.replyMessage, replyRule)];
                    case 10:
                        _a.sent();
                        _a.label = 11;
                    case 11: return [2 /*return*/, this.nextRule(rule, answer)];
                }
            });
        });
    };
    Controller.prototype.jumpByName = function (ruleName) {
        var idx = this.indexes[ruleName];
        if (typeof idx !== 'number') {
            throw new exceptions_1.RuleNotFound(ruleName, this.indexes);
        }
        return this.run(idx);
    };
    Controller.prototype.nextRule = function (currentRule, answer) {
        var bot = this.bot;
        var nextRuleName = getNextFromRule(currentRule, answer);
        if (nextRuleName) {
            this.jumpByName(nextRuleName);
        }
        else {
            var nextIdx = bot.store.get('currentIdx') + 1;
            this.run(nextIdx);
        }
        return this;
    };
    return Controller;
}());
exports.Controller = Controller;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var module_1 = __webpack_require__(1);
var actions = {
    timeout: function (value) {
        return new Promise(function (resolve) { return setTimeout(resolve, value); });
    }
};
var Actions = /** @class */ (function (_super) {
    __extends(Actions, _super);
    function Actions() {
        var _this = _super.call(this) || this;
        _this.define(actions);
        return _this;
    }
    return Actions;
}(module_1.DefineModule));
exports.Actions = Actions;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __webpack_require__(0);
var module_1 = __webpack_require__(1);
var utils = __webpack_require__(3);
var types = {
    Any: {},
    String: {
        parser: function (value) { return String(value); },
        validators: [
            {
                string: true,
                warning: 'Invalid string',
            },
        ]
    },
    Number: {
        parser: function (value) { return Number(value); },
        validators: [
            {
                number: true,
                warning: 'Invalid number',
            },
        ],
    },
    SingleChoice: {
        parser: function (value, rule) {
            var option = utils.findOptionByAnswer(rule.options, value);
            if (!option) {
                return undefined;
            }
            return option.value || option.label;
        },
        validators: [
            {
                function: function (answer, rule) {
                    return !!utils.findOptionByAnswer(rule.options, answer);
                },
                warning: 'Unknown option',
            },
        ],
    },
    MultipleChoice: {
        parser: function (answer, rule) {
            var values;
            if (answer instanceof Array) {
                values = answer;
            }
            else {
                var options = rule.options.map(function (o) { return String(o.value || o.label); });
                values = utils.identifyAnswersInString(String(answer), options);
            }
            return lodash_1.uniq(values
                .map(function (value) {
                var option = utils.findOptionByAnswer(rule.options, value);
                if (!option) {
                    return undefined;
                }
                return option.value || option.label;
            })
                .filter(function (x) { return x; }));
        },
        validators: [
            {
                function: function (answer, rule) {
                    var answers = utils.ensureArray(answer);
                    var options = rule.options.map(function (o) { return String(o.value || o.label); });
                    return answers.every(function (a) { return options.some(function (o) { return utils.isMatchAnswer(a, o); }); });
                },
                warning: 'Unknown options',
            },
        ],
    },
};
var Types = /** @class */ (function (_super) {
    __extends(Types, _super);
    function Types() {
        var _this = _super.call(this) || this;
        _this.define(types);
        return _this;
    }
    return Types;
}(module_1.DefineModule));
exports.Types = Types;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var module_1 = __webpack_require__(1);
var isNumber = function (v) { return /^\d+$/.test(v); };
var isEmail = function (v) { return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v); }; // http://emailregex.com
var sanitizeLength = function (v) { return isNumber(v) ? Number(v) : v.length; };
var validators = {
    required: {
        validate: function (expected, answer) {
            return Boolean((answer || '').trim()) === expected;
        },
        warning: 'This is required',
    },
    email: {
        validate: function (expected, answer) {
            return isEmail(answer) === expected;
        },
        warning: 'Invalid email format',
    },
    regex: {
        validate: function (reg, answer) {
            return new RegExp(reg).test(answer);
        },
        warning: 'Invalid answer format',
    },
    minWords: {
        validate: function (num, answer) {
            return answer.split(' ').length >= num;
        },
        warning: function (min) { return "This answer must have at least " + min + " words"; },
    },
    maxWords: {
        validate: function (num, answer) {
            return answer.split(' ').length <= num;
        },
        warning: function (max) { return "This answer must have a maximum " + max + " words"; },
    },
    min: {
        validate: function (num, answer) {
            return sanitizeLength(answer) >= num;
        },
        warning: function (min) { return "This answer length must be min " + min; },
    },
    max: {
        validate: function (num, answer) {
            return sanitizeLength(answer) <= num;
        },
        warning: function (max) { return "This answer length must be max " + max; },
    },
    lenght: {
        validate: function (num, answer) {
            return sanitizeLength(answer) === num;
        },
        warning: function (num) { return "It must have lenght " + num; },
    },
    string: {
        validate: function (expected, answer) {
            return Boolean(!isNumber(answer) && typeof answer === 'string') === expected;
        },
        warning: 'It must be a string',
    },
    number: {
        validate: function (expected, answer) {
            return isNumber(answer) === expected;
        },
        warning: 'It must be a number',
    },
    function: {
        validate: function (fn, answer, rule) { return fn(answer, rule); },
        warning: 'Error on execute a validator function',
    },
};
var Validators = /** @class */ (function (_super) {
    __extends(Validators, _super);
    function Validators() {
        var _this = _super.call(this) || this;
        _this.define(validators);
        return _this;
    }
    return Validators;
}(module_1.DefineModule));
exports.Validators = Validators;


/***/ })
/******/ ]);