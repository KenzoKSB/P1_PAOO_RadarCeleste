const axios = require('axios')
const express = require('express')
const app = express()
//middleware
app.use(express.json())

/*
{
  1: {
    id: 1,
    local: 'Liberdade',
    descricao: 'Luz branca caindo do céu'
  },
  2: {
    id: 2,
    local: 'Vila Mariana',
    descricao: 'Objeto não identificado com luz piscante'
  }
}
*/
//base em memória volátil
const avistamentos = {}
//contador de ids, começa em zero
let contador = 0

//GET /avistamentos
//devolve a base inteira
app.get('/avistamentos', (req, res) => {
  res.json(avistamentos)
})

//PUT /avistamentos
//corpo: { local, descricao }
app.put('/avistamentos', (req, res) => {
  const { local, descricao } = req.body || {}
  const vazio = (valor) => typeof valor !== 'string' || valor.trim() === ''
  //validar antes de alterar a base ou o contador
  if (vazio(local) || vazio(descricao)) {
    return res.status(400).json({ erro: "local e descricao são obrigatórios" })
  }
  contador++
  const id = contador
  const avistamento = {
    id: id,
    local: local,
    descricao: descricao
  }
  avistamentos[id] = avistamento
  res.status(201).json(avistamento)
})

const port = 4000
app.listen(port, () => console.log(`Avistamentos. Porta ${port}.`))
