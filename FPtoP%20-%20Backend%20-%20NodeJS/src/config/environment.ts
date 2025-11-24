// src/config/environment.ts
export function GetRequiredEnvVar(varName: string): string {
  const value = process.env[varName];
  if (!value) {
    console.error(`❌ ERROR: Falta la variable de entorno '${varName}'`);
    console.error(
      '🌐 Variables de entorno disponibles:',
      Object.keys(process.env),
    );
    throw new Error(`Falta la variable de entorno: ${varName}`);
  }
  return value;
}
