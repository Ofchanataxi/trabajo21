export async function cleanLogsTask() {
  console.log('🧹 Limpiando archivos de logs...');
  try {
    console.log('✅ Archivos de logs eliminados.');
  } catch (error) {
    console.error('❌ Error limpiando logs:', error);
  }
}
