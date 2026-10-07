const axios = require('axios')
const express = require('express')
const app = express()
//middleware
app.use(express.json())

//POST /eventos
//recebe o evento e repassa a todos os microsserviços (broadcast)
app.post('/eventos', (req, res) => {
  //pegar o corpo da requisição
  const evento = req.body
  console.log(evento)
  //enviar via post para os mss
  //cada repasse tem o seu catch: um mss fora do ar não derruba o barramento
  axios.post('http://localhost:4000/eventos', evento)
    .catch(err => console.log(`Falha ao repassar o evento para a porta 4000`))
  axios.post('http://localhost:4100/eventos', evento)
    .catch(err => console.log(`Falha ao repassar o evento para a porta 4100`))
  axios.post('http://localhost:4200/eventos', evento)
    .catch(err => console.log(`Falha ao repassar o evento para a porta 4200`))
  res.json({ msg: 'ok' })
})

//colocar o barramento para operar na porta 10000
const port = 10000
app.listen(port, () => console.log(`Barramento de eventos. Porta ${port}.`))
