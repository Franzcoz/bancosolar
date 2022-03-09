const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'bancosolar',
    max: 20,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});

async function get_usuarios() {
    const client = await pool.connect()
    const res = await client.query({
        text: 'select * from usuarios',
    });
    client.release()
    return res.rows
};

async function get_transferencias() {
    const client = await pool.connect()
    const res = await client.query({
        text: 'select emi.id, emi.emisor, usuarios.nombre as receptor, emi.monto, emi.fecha from (select transferencias.id, usuarios.nombre as emisor, transferencias.receptor, transferencias.monto, transferencias.fecha from transferencias join usuarios on usuarios.id = transferencias.emisor) as emi join usuarios on usuarios.id = emi.receptor',
        rowMode: 'array'
    });
    client.release()
    return res.rows
};

async function create_usr(nom, bal) {
    const client = await pool.connect()
    const res = await client.query({
        text: 'insert into usuarios (nombre, balance) values ($1, $2)',
        values: [nom, bal]
    });
    client.release()
    return res.rows
};

async function create_transf(emi, rec, mon) {
    const client = await pool.connect();
    const res = await client.query({
        text: 'select balance from usuarios where id = $1',
        values: [emi]
    });
    const balance = res.rows[0].balance;
    if (balance >= mon) {
        const res1 = await client.query({
            text: 'update usuarios set balance = balance - $2 where id = $1',
            values: [emi, mon]
        });
        const res2 = await client.query({
            text: 'update usuarios set balance = balance + $2 where id = $1',
            values: [rec, mon]
        });
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

module.exports = { get_usuarios, get_transferencias, create_usr, create_transf }