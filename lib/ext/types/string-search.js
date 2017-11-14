(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('isomorphic-unfetch'), require('../../core')) :
	typeof define === 'function' && define.amd ? define(['isomorphic-unfetch', '../../core'], factory) :
	(factory(null,global.YveBot));
}(this, (function (isomorphicUnfetch,YveBot) { 'use strict';

YveBot = YveBot && YveBot.hasOwnProperty('default') ? YveBot['default'] : YveBot;

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */













function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
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
}

var _this = undefined;
var _a = YveBot.exceptions;
var PauseRuleTypeExecutors = _a.PauseRuleTypeExecutors;
var ValidatorError = _a.ValidatorError;
YveBot.types.define('StringSearch', {
    executors: [
        {},
        {
            transform: function (answer, rule, bot) { return __awaiter(_this, void 0, void 0, function () {
                var _a, apiURI, apiQueryParam, translate, messages, searchURI;
                return __generator(this, function (_b) {
                    _a = rule.config, apiURI = _a.apiURI, apiQueryParam = _a.apiQueryParam, translate = _a.translate, messages = _a.messages;
                    searchURI = apiURI + "?" + apiQueryParam + "=" + encodeURIComponent(String(answer));
                    bot.dispatch('typing');
                    return [2, fetch(searchURI)
                            .then(function (res) { return res.json(); })
                            .then(function (list) {
                            if (list.length === 0) {
                                throw new ValidatorError(messages.noResults, rule);
                            }
                            return list;
                        })
                            .then(function (list) {
                            if (!translate) {
                                return list;
                            }
                            var label = translate.label, value = translate.value;
                            return list.map(function (obj) { return ({ label: obj[label], value: obj[value] }); });
                        })];
                });
            }); },
        },
        {
            transform: function (results, rule, bot) { return __awaiter(_this, void 0, void 0, function () {
                var messages, options, message;
                return __generator(this, function (_a) {
                    messages = rule.config.messages;
                    if (results.length === 1) {
                        message = messages.didYouMean + ": " + results[0].label + "?";
                        options = [
                            { label: messages.yes, value: results[0].value },
                            { label: messages.no, value: null },
                        ];
                    }
                    else {
                        message = messages.multipleResults + ":";
                        options = results.concat([{
                                label: messages.noneOfAbove,
                                value: null,
                            }]);
                    }
                    bot.talk(message, { type: 'SingleChoice', options: options });
                    throw new PauseRuleTypeExecutors(rule.name);
                });
            }); },
        },
        {
            validators: [{
                    function: function (answer, rule, bot) {
                        var messages = rule.config.messages;
                        if (!answer) {
                            bot.store.unset("executors." + rule.name + ".currentIdx");
                            bot.talk(messages.wrongResult);
                            throw new PauseRuleTypeExecutors(rule.name);
                        }
                        return true;
                    },
                }],
        },
    ],
});

})));
