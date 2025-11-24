'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
function GetRequiredEnvVar(name) {
  var value = process.env[name];
  if (value === undefined) {
    throw new Error(
      'La variable de entorno requerida '.concat(
        name,
        ' no est\u00E1 definida.',
      ),
    );
  }
  return value;
}
exports.default = GetRequiredEnvVar;
