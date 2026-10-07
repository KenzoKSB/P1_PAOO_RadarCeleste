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
app.put('/avistamentos/:id/relatos', async (req, res) => {
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
  //emitir o evento de criação de relato
  await axios.post('http://localhost:10000/eventos', {
    tipo: 'RelatoCriado',
    dados: {
      id: relato.id,
      texto: relato.texto,
      confirmacoes: relato.confirmacoes,
      avistamentoId: req.params.id
    }
  })
  res.status(201).json(relatosDoAvistamento)
})

//GET /avistamentos/1/relatos
app.get('/avistamentos/:id/relatos', (req, res) => {
  res.json(relatosPorAvistamentoId[req.params.id] || [])
})

//POST /eventos
//exibe o tipo do evento recebido e encerra a requisição
app.post('/eventos', (req, res) => {
  const evento = req.body
  console.log(evento.tipo)
  res.json({ msg: 'ok' })
})

const port = 4100
app.listen(port, () => console.log(`Relatos. Porta ${port}.`))
