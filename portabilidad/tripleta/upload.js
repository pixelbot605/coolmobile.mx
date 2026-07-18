const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const csv = require('csv-parser');

// 1. Inicializar Firebase con tus credenciales
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function uploadData() {
  const registros = [];
  
  console.log("Leyendo el archivo CSV...");

  // 2. Leer el CSV y guardar los datos en memoria
  fs.createReadStream('datos.csv')
    .pipe(csv())
    .on('data', (row) => {
      registros.push(row);
    })
    .on('end', async () => {
      console.log(`Se leyeron ${registros.length} registros. Iniciando subida a Firestore...`);
      
      // 3. Preparar la subida por lotes (máximo 500 operaciones por batch)
      const LIMITE_BATCH = 500;
      let batch = db.batch();
      let contador = 0;
      let lotesSubidos = 0;

      for (let i = 0; i < registros.length; i++) {
        const fila = registros[i];
        
        // Asegúrate de que los nombres coincidan con los encabezados de tu CSV
        const icc = fila.ICC ? fila.ICC.toString().trim() : null;
        const dn = fila.DN ? fila.DN.toString().trim() : null;

        if (icc && dn) {
          const docRef = db.collection('inventario_sims').doc(icc);
          batch.set(docRef, { dn: dn });
          contador++;
        }

        // Si llegamos a 500 o estamos en el último registro del array, enviamos el lote
        if (contador === LIMITE_BATCH || i === registros.length - 1) {
          try {
            await batch.commit();
            lotesSubidos++;
            console.log(`Lote ${lotesSubidos} subido (aprox ${lotesSubidos * LIMITE_BATCH} registros procesados)...`);
            
            // Reiniciar el batch y el contador para el siguiente bloque
            batch = db.batch();
            contador = 0;
          } catch (error) {
            console.error(`Error al subir el lote ${lotesSubidos + 1}:`, error);
          }
        }
      }
      
      console.log("¡Migración completada con éxito!");
    });
}

uploadData();