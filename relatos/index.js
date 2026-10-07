const axios = require('axios')
const express = require('express')
const { v4: uuidv4 } = require('uuid')
const app = express()
//middleware
app.use(express.json())

/*
{
  1: [
    {
      id: '12345',
      texto: 'Vi uma luz branca',
      confirmacoes: 0
    },
    {
      id: '1234',
      texto: 'Eu também vi',
      confirmacoes: 0
    }
  ],
  2: [
    {}
  ]
}
*/
//base em memória volátil: chave é o id do avistamento, valor é o vetor de relatos
const relatosPorAvistamentoId = {}

//PUT /avistamentos/1/relatos
//corpo: { texto }
app.put('/avistamentos/:id/relatos', (req, res) => {
  const idRelato = uuidv4()
  const { texto } = req.body || {}
  const relato = {
    id: idRelato,
    texto: texto,
    confirmacoes: 0
  }
  //cria o vetor caso o avistamento ainda não tenha relatos
  const relatosDoAvistamento = relatosPorAvistamentoId[req.params.id] || []
  relatosDoAvistamento.push(relato)
  relatosPorAvistamentoId[req.params.id] = relatosDoAvistamento
  res.status(201).json(relatosDoAvistamento)
})

//GET /avistamentos/1/relatos
app.get('/avistamentos/:id/relatos', (req, res) => {
  res.json(relatosPorAvistamentoId[req.params.id] || [])
})

const port = 4100
app.listen(port, () => console.log(`Relatos. Porta ${port}.`))
