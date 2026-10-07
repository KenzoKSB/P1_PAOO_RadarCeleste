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

//Post /avistamentos/1/relatos
//corpo: { texto }
app.post('/avistamentos/:id/relatos', async (req, res) => {
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

//POST /avistamentos/1/relatos/<idRelato>/confirmações
//sem corpo: soma 1 às confirmações do relato e emite o evento RelatoConfirmado
const confirmarRelato = async (req, res) => {
  //pegar o vetor de relatos do avistamento ou um vetor vazio
  const relatos = relatosPorAvistamentoId[req.params.id] || []
  for (let relato of relatos) {
    if (relato.id === req.params.idRelato) {
      relato.confirmacoes++
      //emitir o evento de confirmação de relato
      await axios.post('http://localhost:10000/eventos', {
        tipo: 'RelatoConfirmado',
        dados: {
          id: relato.id,
          avistamentoId: req.params.id,
          confirmacoes: relato.confirmacoes
        }
      })
      return res.json(relato)
    }
  }
  res.status(404).json({ erro: 'relato não encontrado' })
}
//o caminho aceita o "ç" e o "õ" tanto escritos quanto codificados na URL (%C3%A7 e %C3%B5)
app.post('/avistamentos/:id/relatos/:idRelato/confirmações', confirmarRelato)
app.post('/avistamentos/:id/relatos/:idRelato/confirma%C3%A7%C3%B5es', confirmarRelato)

//POST /eventos
//exibe o tipo do evento recebido e encerra a requisição
app.post('/eventos', (req, res) => {
  const evento = req.body
  console.log(evento.tipo)
  res.json({ msg: 'ok' })
})

const port = 4100
app.listen(port, () => console.log(`Relatos. Porta ${port}.`))
