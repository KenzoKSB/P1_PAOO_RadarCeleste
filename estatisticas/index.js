const express = require('express')
const app = express()
//middleware
app.use(express.json())

//base em memória volátil
//totais gerais da plataforma
const totais = {
  avistamentos: 0,
  relatos: 0,
  confirmacoes: 0
}
//movimento por local, inicialmente vazio
const locais = {}

// base auxiliar para associar o id do avistamento ao seu local
const localPorAvistamentoId = {}

// mapa de funções para tratar os eventos
const funcoes = {
  AvistamentoCriado: (dados) => {
    localPorAvistamentoId[dados.id] = dados.local
    if (!locais[dados.local]) {
      locais[dados.local] = { avistamentos: 0, relatos: 0, confirmacoes: 0 }
    }
    locais[dados.local].avistamentos++
    totais.avistamentos++
  },
  RelatoCriado: (dados) => {
    const local = localPorAvistamentoId[dados.avistamentoId]
    if (local && locais[local]) {
      locais[local].relatos++
      totais.relatos++
    }
  },
  RelatoConfirmado: (dados) => {
    const local = localPorAvistamentoId[dados.avistamentoId]
    if (local && locais[local]) {
      locais[local].confirmacoes++
      totais.confirmacoes++
    }
  }
}

//GET /estatisticas
app.get('/estatisticas', (req, res) => {
  res.json({ totais, locais })
})

//GET /estatisticas/destaque
app.get('/estatisticas/destaque', (req, res) => {
  let maiorEngajamento = -1
  let localDestaque = null

  for (let local in locais) {
    const engajamento = locais[local].relatos + locais[local].confirmacoes
    if (engajamento > maiorEngajamento) {
      maiorEngajamento = engajamento
      localDestaque = local
    }
  }

  if (!localDestaque) {
    return res.status(404).json({ erro: 'sem dados' })
  }

  res.json({ local: localDestaque, engajamento: maiorEngajamento })
})

//POST /eventos
app.post('/eventos', (req, res) => {
  const evento = req.body
  const funcao = funcoes[evento.tipo]
  if (funcao) {
    funcao(evento.dados)
  }
  res.json({ msg: 'ok' })
})

const port = 4300
app.listen(port, () => console.log(`Estatisticas. Porta ${port}.`))
