const { get_usuarios, get_transferencias, create_usr, create_transf } = require('./db.js');
const express = require('express');

const app = express()

// Definimos uso de ruta estática
app.use(express.static('static'));

app.post('/usuario', (req, res) => {
    try{
        let body = "";
        req.on('data', (data) => {
            body += data
        });
        req.on('end', async () => {
            const datos = Object.values(JSON.parse(body));
            const datos2 = await create_usr(datos[0], datos[1]);
            return res.send('usuario agregado');
        })
    } catch (err) {
        return res.status(400).send(err);
    }
});

app.post('/transferencia', (req, res) => {
    try{
        let body = "";
        req.on('data', (data) => {
            body += data
        });
        req.on('end', async () => {
            const datos = Object.values(JSON.parse(body));
            const datos2 = await create_transf(datos[0], datos[1], datos[2]);
            console.log(datos2)
        })
    } catch (err) {
        return res.status(400).send(err);
    }
});

app.get('/usuarios', async (req, res) => {
    try{
        const usrs = await get_usuarios();
        res.send(usrs);
        return;
    } catch (err) {
        return res.status(500).send(err);
    }
});

app.get('/transferencias', async (req, res) => {
    try{
        const tnsf = await get_transferencias();
        res.send(tnsf);
        return;
    } catch (err) {
        return res.status(500).send(err);
    }
});

app.listen(3000, ()=> console.log('Servidor sirviendo en instancia de servicio (puerto) 3000'));
