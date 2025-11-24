// 'use strict';
// var __assign =
//   (this && this.__assign) ||
//   function () {
//     __assign =
//       Object.assign ||
//       function (t) {
//         for (var s, i = 1, n = arguments.length; i < n; i++) {
//           s = arguments[i];
//           for (var p in s)
//             if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
//         }
//         return t;
//       };
//     return __assign.apply(this, arguments);
//   };
// var __awaiter =
//   (this && this.__awaiter) ||
//   function (thisArg, _arguments, P, generator) {
//     function adopt(value) {
//       return value instanceof P
//         ? value
//         : new P(function (resolve) {
//             resolve(value);
//           });
//     }
//     return new (P || (P = Promise))(function (resolve, reject) {
//       function fulfilled(value) {
//         try {
//           step(generator.next(value));
//         } catch (e) {
//           reject(e);
//         }
//       }
//       function rejected(value) {
//         try {
//           step(generator['throw'](value));
//         } catch (e) {
//           reject(e);
//         }
//       }
//       function step(result) {
//         result.done
//           ? resolve(result.value)
//           : adopt(result.value).then(fulfilled, rejected);
//       }
//       step((generator = generator.apply(thisArg, _arguments || [])).next());
//     });
//   };
// var __generator =
//   (this && this.__generator) ||
//   function (thisArg, body) {
//     var _ = {
//         label: 0,
//         sent: function () {
//           if (t[0] & 1) throw t[1];
//           return t[1];
//         },
//         trys: [],
//         ops: [],
//       },
//       f,
//       y,
//       t,
//       g;
//     return (
//       (g = { next: verb(0), throw: verb(1), return: verb(2) }),
//       typeof Symbol === 'function' &&
//         (g[Symbol.iterator] = function () {
//           return this;
//         }),
//       g
//     );
//     function verb(n) {
//       return function (v) {
//         return step([n, v]);
//       };
//     }
//     function step(op) {
//       if (f) throw new TypeError('Generator is already executing.');
//       while ((g && ((g = 0), op[0] && (_ = 0)), _))
//         try {
//           if (
//             ((f = 1),
//             y &&
//               (t =
//                 op[0] & 2
//                   ? y['return']
//                   : op[0]
//                     ? y['throw'] || ((t = y['return']) && t.call(y), 0)
//                     : y.next) &&
//               !(t = t.call(y, op[1])).done)
//           )
//             return t;
//           if (((y = 0), t)) op = [op[0] & 2, t.value];
//           switch (op[0]) {
//             case 0:
//             case 1:
//               t = op;
//               break;
//             case 4:
//               _.label++;
//               return { value: op[1], done: false };
//             case 5:
//               _.label++;
//               y = op[1];
//               op = [0];
//               continue;
//             case 7:
//               op = _.ops.pop();
//               _.trys.pop();
//               continue;
//             default:
//               if (
//                 !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
//                 (op[0] === 6 || op[0] === 2)
//               ) {
//                 _ = 0;
//                 continue;
//               }
//               if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
//                 _.label = op[1];
//                 break;
//               }
//               if (op[0] === 6 && _.label < t[1]) {
//                 _.label = t[1];
//                 t = op;
//                 break;
//               }
//               if (t && _.label < t[2]) {
//                 _.label = t[2];
//                 _.ops.push(op);
//                 break;
//               }
//               if (t[2]) _.ops.pop();
//               _.trys.pop();
//               continue;
//           }
//           op = body.call(thisArg, _);
//         } catch (e) {
//           op = [6, e];
//           y = 0;
//         } finally {
//           f = t = 0;
//         }
//       if (op[0] & 5) throw op[1];
//       return { value: op[0] ? op[1] : void 0, done: true };
//     }
//   };
// Object.defineProperty(exports, '__esModule', { value: true });
// var tedious_1 = require('tedious');
// var GetRequiredEnVar_1 = require('../../utils/GetRequiredEnVar');
// var dotenv_1 = require('dotenv');
// dotenv_1.default.config();
// var SQLServerDatabase = /** @class */ (function () {
//   function SQLServerDatabase() {
//     var config = {
//       server: (0, GetRequiredEnVar_1.default)('SQLSERVER_DB_SERVER'),
//       authentication: {
//         type: 'default',
//         options: {
//           userName: (0, GetRequiredEnVar_1.default)('SQLSERVER_DB_USER'),
//           password: (0, GetRequiredEnVar_1.default)('SQLSERVER_DB_PWD'),
//         },
//       },
//       options: {
//         encrypt: false,
//         database: (0, GetRequiredEnVar_1.default)('SQLSERVER_DB_NAME'),
//         rowCollectionOnRequestCompletion: true,
//       },
//     };
//     this.connection = new tedious_1.Connection(config);
//   }
//   SQLServerDatabase.prototype.connect = function () {
//     return __awaiter(this, void 0, void 0, function () {
//       var _this = this;
//       return __generator(this, function (_a) {
//         return [
//           2 /*return*/,
//           new Promise(function (resolve, reject) {
//             _this.connection.on('connect', function (err) {
//               if (err) {
//                 console.error(err);
//                 reject('Connection Failed: '.concat(err.message));
//               }
//               //console.log('Connected');
//               resolve();
//             });
//             _this.connection.connect();
//           }),
//         ];
//       });
//     });
//   };
//   SQLServerDatabase.prototype.disconnect = function () {
//     return __awaiter(this, void 0, void 0, function () {
//       return __generator(this, function (_a) {
//         this.connection.close();
//         return [2 /*return*/];
//       });
//     });
//   };
//   SQLServerDatabase.prototype.query = function (sql, params) {
//     return __awaiter(this, void 0, void 0, function () {
//       var _this = this;
//       return __generator(this, function (_a) {
//         return [
//           2 /*return*/,
//           new Promise(function (resolve, reject) {
//             // Implementar lógica para manejar parámetros y ejecutar consultas
//             var dbQuery = sql;
//             var request = new tedious_1.Request(dbQuery, function (
//               err,
//               rowCount,
//               rows,
//             ) {
//               var _a;
//               if (err) {
//                 //console.log(err);
//                 reject('SQL Query: '.concat(err));
//               }
//               var response = rows;
//               var data = [];
//               for (var i = 0; i < response.length; i++) {
//                 var element = response[i];
//                 var valoresFila = {};
//                 for (var j = 0; j < element.length; j++) {
//                   var element2 = element[j];
//                   var objFila =
//                     ((_a = {}),
//                     (_a[element2.metadata.colName] = element2.value),
//                     _a);
//                   var aux = __assign({}, valoresFila);
//                   valoresFila = __assign(__assign({}, aux), objFila);
//                 }
//                 data.push(valoresFila);
//               }
//               var rowCountResponse = rowCount === undefined ? 0 : rowCount;
//               var newResponse = {
//                 data: data,
//                 totalRows: rowCountResponse,
//               };
//               resolve(newResponse);
//             });
//             // Si luego necesito optimizar las consultas porque se demoran mucho
//             /* request.on('row', function(columns) {
//                           //console.log("On row");
//                           columns.forEach(function(column: { value: string | null; }) {
//                             if (column.value === null) {
//                               //console.log('NULL');
//                             } else {
//                               result+= column.value + " ";
//                             }
//                           });
//                           //console.log(result);
//                           result ="";
//                         });   */
//             /* request.on('done', function(rowCount, more) {
//                           //console.log(rowCount + ' rows returned');
//                           //resolve(rowCount);
//                         });   */
//             _this.connection.execSql(request);
//           }),
//         ];
//       });
//     });
//   };
//   return SQLServerDatabase;
// })();
// exports.default = SQLServerDatabase;
