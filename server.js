// Importamos librerías y funciones locales
const express = require('express');
const { get_usuarios, get_transferencias, create_usr, create_transf, edit_usr, delete_usr } = require('./db.js');

// Creamos aplicación express
const app = express()

// Definimos uso de ruta estática
app.use(express.static('static'));

// Definimos ruta POST usuario utilizando bloques try catch (igualmente para el resto)
app.post('/usuario', async (req, res) => {
    try{
        // Creamos variable vacía body
        let body = "";
        // recibimos datos enviados por el llamado a la API en frontend
        req.on('data', (data) => {
            // Almacenamos dichos datos en variable body
            body += data
        });
        req.on('end', async () => {
            // Transformamos en objeto JSON y extraemos sus valores para guardarlos en un arreglo
            const datos = Object.values(JSON.parse(body));
            // llamamos a función de consulta sql entregando datos del arreglo
            const datos2 = await create_usr(datos[0], datos[1]);
            return res.json({msg: 'usuario agregado'});
        })
    } catch (err) {
        // Capturamos error y lo enviamos a consola
        console.log(err);
    }
});

// Definimos ruta POST transferencia
app.post('/transferencia', async (req, res) => {
    try{
        let body = "";
        req.on('data', (data) => {
            body += data
        });
        req.on('end', async () => {
            const datos = Object.values(JSON.parse(body));
            const datos2 = await create_transf(datos[0], datos[1], datos[2]);
            return res.json({msg: 'Transferencia realizada'});
        });
    } catch (err) {
        return res.status(400).send(err);
    }
});

// Definimos ruta GET usuario
app.get('/usuarios', async (req, res) => {
    try{
        const usrs = await get_usuarios();
        res.send(usrs);
        return;
    } catch (err) {
        return res.status(503).send(`{error: "${err}"}`);
    }
});

// Definimos ruta GET transferencia
app.get('/transferencias', async (req, res) => {
    try{
        const tnsf = await get_transferencias();
        res.send(tnsf);
        return;
    } catch (err) {
        return res.status(503).send(err);
    }
});

// Definimos ruta PUT usuario
app.put('/usuario', async (req, res) => {
    try{
        let body = "";
        const id = parseInt(req.query.id);
        req.on('data', (data) => {
            body += data
        });
        req.on('end', async () => {
            let datos = Object.values(JSON.parse(body));
            datos.push(id);
            const datos2 = await edit_usr(datos[2], datos[0], datos[1]);
            return res.json({msg: 'usuario editado'});
        })
    } catch (err) {
        return res.status(400).send(err);
    }
});

// Definimos ruta DELETE usuario
app.delete('/usuario', async (req, res) => {
    try{
        const ide = parseInt(req.query.id);
        await delete_usr(ide);
        return res.json({msg: 'usuario eliminado'});
    } catch (err) {
        return res.status(400).send(err);
    }
});

// Creamos instancia de servidor en puerto local 3000
app.listen(3000, ()=> console.log('Servidor funcionando correctamente en el puerto 3000'));
