const express = require('express')
const app = express()
//middleware
app.use(express.json())

/*
{
  1: {
    id: 1,
    local: 'Liberdade',
    descricao: 'Luz branca caindo do céu',
    relatos: [
      {
        id: '3f1c2d4e-...',
        texto: 'Vi uma luz branca de madrugada',
        confirmacoes: 0,
        avistamentoId: '1'
      }
    ]
  }
}
*/
//base em memória volátil
const baseConsulta = {}

//mapa de funções, indexado pelo tipo do evento
const funcoes = {
  AvistamentoCriado: (avistamento) => {
    //armazenar o avistamento na chave do seu id, já com a lista de relatos vazia
    baseConsulta[avistamento.id] = {
      id: avistamento.id,
      local: avistamento.local,
      descricao: avistamento.descricao,
      relatos: []
    }
  },
  RelatoCriado: (relato) => {
    //pegar a lista de relatos do avistamento a que o relato recebido pertence ou uma lista vazia
    const relatos = baseConsulta[relato.avistamentoId]['relatos'] || []
    //cadastra o relato na lista (push)
    relatos.push(relato)
    //ajustar a baseConsulta para que ela aponte para a lista
    baseConsulta[relato.avistamentoId]['relatos'] = relatos
  }
}

//GET /avistamentos
//devolve a baseConsulta inteira
app.get('/avistamentos', (req, res) => {
  res.json(baseConsulta)
})

//POST /eventos
//executa a função do tipo recebido, entregando a ela o campo dados
app.post('/eventos', (req, res) => {
  const evento = req.body
  console.log(evento.tipo)
  //o barramento faz broadcast: tipos que a consulta não trata são ignorados
  if (funcoes[evento.tipo]) {
    funcoes[evento.tipo](evento.dados)
  }
  res.json({ msg: 'ok' })
})

const port = 4200
app.listen(port, () => console.log(`Consulta. Porta ${port}.`))
