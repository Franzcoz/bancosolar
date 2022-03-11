// Importamos clase Pool de la librería pg
const { Pool } = require('pg');

// Almacenamos un nuevo objeto declase Pool con los datos
// de conexión a la base de datos
const pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'bancosolar',
    max: 20,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});

// Creamos función de consulta a base de datos
// para obtener los usuarios registrados
async function get_usuarios() {
    try {
            // Conectamos a la base de datos y solicitamos un cliente
        const client = await pool.connect();
        // Realizamos la consulta parametrizada a la base de datos
        const res = await client.query({
            text: 'select * from usuarios',
        });
        // Liberamos el cliente y retornamos los resultados de la consulta
        client.release()
        return res.rows
    }
    catch (err) {
        throw err;
    }  
};

// Creamos función para obtener tabla de transferencias
async function get_transferencias() {
    try {
        const client = await pool.connect()
        const res = await client.query({
            text: 'select emi.id, emi.emisor, usuarios.nombre as receptor, emi.monto, emi.fecha from (select transferencias.id, usuarios.nombre as emisor, transferencias.receptor, transferencias.monto, transferencias.fecha from transferencias join usuarios on usuarios.id = transferencias.emisor) as emi join usuarios on usuarios.id = emi.receptor',
            rowMode: 'array'
        });
        client.release()
        return res.rows
    }
    catch (err) {
        console.log(`Esto es un error: ${err}`);
        throw err;
        return
    }
};

// Creamos función para crear usuarios
async function create_usr(nom, bal) {
    try {
        const client = await pool.connect()
        const res = await client.query({
            text: 'insert into usuarios (nombre, balance) values ($1, $2)',
            values: [nom, bal]
        });
        client.release()
        return res.rows
    }
    catch(err) {
        throw err;
    }
    
};

// Creamos función para realizar transferencias
// Esta función recibe emisor y receptor como npumero de id
// (Se modificaron líneas 283 y 284 del index.html para enviar estos id)
async function create_transf(emi, rec, mon) {
    const client = await pool.connect();
    // Consultar por el balance del emisor
    const res = await client.query({
        text: 'select balance from usuarios where id = $1',
        values: [emi]
    });
    const balance = res.rows[0].balance;
    // Ejecutar las consultas siguientes si el balance es igual o superior al monto a transferir
    if (balance >= mon) {
        // Restamos el monto al balance del emisor
        const res1 = await client.query({
            text: 'update usuarios set balance = balance - $2 where id = $1',
            values: [emi, mon]
        });
        // Sumamos el monto al balance del receptor
        const res2 = await client.query({
            text: 'update usuarios set balance = balance + $2 where id = $1',
            values: [rec, mon]
        });
        // Creamos registro de la nueva transferencia
        const res3 = await client.query({
            text: 'insert into transferencias (emisor, receptor, monto, fecha) values ($1, $2, $3, now())',
            values: [emi, rec, mon]
        });
        client.release();
    } else {
        const err = 'El monto a transferir excede el balance actual de la cuenta';
        return err;
    }
};

// Creamos función para editar un usuario
async function edit_usr(id, nom, bal) {
    const client = await pool.connect()
    const res = await client.query({
        text: 'update usuarios set nombre = $2, balance = $3 where id = $1',
        values: [id, nom, bal]
    });
    client.release()
    return res.rows
};

// Creamos función para eliminar un usuario
async function delete_usr(id) {
    const client = await pool.connect()
    const res = await client.query({
        text: 'delete from usuarios where id = $1',
        values: [id]
    });
    client.release()
    return res.rows
};

// Exportamos las funciones creadas
module.exports = { get_usuarios, get_transferencias, create_usr, create_transf, edit_usr, delete_usr }