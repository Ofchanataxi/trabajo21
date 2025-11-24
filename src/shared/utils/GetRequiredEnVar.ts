export default function GetRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (value === undefined) {
    throw new Error(
      `La variable de entorno requerida ${name} no está definida.`,
    );
  }
  return value;
}
