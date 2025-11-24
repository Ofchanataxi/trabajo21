'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.createDatabase = void 0;
var PostgreSQLDatabase_1 = require('./PostgreSQLDatabase');
var SQLServerDatabase_1 = require('./SQLServerDatabase');
('./SQLServerDatabase');
function createDatabase(type) {
  switch (type) {
    case 'POSTGRESQL':
      return new PostgreSQLDatabase_1.default();
    case 'SQLSERVER':
      return new SQLServerDatabase_1.default();
    default:
      throw new Error('Database type not supported');
  }
}
exports.createDatabase = createDatabase;
