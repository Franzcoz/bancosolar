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
    const res = await client.query('select * from usuarios');
    client.release()
    return res.rows
};

async function get_transferencias() {
    const client = await pool.connect()
    const res = await client.query({
        text: 'select * from transferencias',
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
    const balance = res.rows;
    client.release();
    return balance;
    /*
    if (balance >= mon) {
        const client = await pool.connect();
        const res1 = await client.query({
        text: 'update usuarios set balance = balance - $3 where emisor = $1',
        values: [emi]
    });
    client.release()
    }
    
    res.then(()=>{
        res2 = await client.query({
            text: 'update usuarios set balance = balance + $3 where receptor = $1',
            values: [rec]
        });
    }, () => {return});
    client.release()
    res2.then(()=>{
        res3 = await client.query({
            text: 'insert into transferencias (emisor, receptor, monto) values ($1, $2, $3)',
            values: [emi, rec, mon]
        });
    }, ()=>{return});
    client.release()
    return [res.rows, res2.rows, res3.rows]*/
};

module.exports = { get_usuarios, get_transferencias, create_usr, create_transf }