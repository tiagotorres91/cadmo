<p align="right"><a href="README.md">English</a> | <b>Português</b></p>

# Cadmo

**Um método right-sized para construir software com a IA como par — o humano especifica e decide; a IA escreve e verifica.**

```bash
npm create cadmo
```

*Um comando instala o método no teu projeto: `AGENTS.md` (o mapa que tua IA lê primeiro), os templates de gate de valor, spec, plano e decisão, e o guard de spec-drift com workflow de CI pronto. Nada é sobrescrito. Tem também o **plugin de Claude Code** (`/plugin marketplace add tiagotorres91/cadmo` → `/plugin install cadmo@cadmo`) com os comandos `/cadmo:gate`, `/cadmo:spec` e `/cadmo:done`.*

A IA tornou escrever código rápido e barato. O risco mudou de *"demora demais"* para *"constrói a coisa errada, com confiança"*. O Cadmo é feito para o jogo que importa agora: não escrever mais rápido — **especificar, verificar e documentar na velocidade em que a IA escreve.**

> No mito grego, **Cadmo** trouxe o alfabeto — a palavra escrita — à Grécia. O primeiro princípio do método é o mesmo: **escreva antes de construir.** A spec antes do código; a decisão com seu porquê; a documentação como artefato vivo que o cliente valida — e que o sistema obedece.

<sub>O nome também é acrônimo dos cinco pilares: **C**ollaboration · **A**pplication · **D**evelopment · **M**anagement · **O**perations.</sub>

## Os cinco pilares

| Pilar | Pergunta que responde |
|---|---|
| 🗂️ **Management** | Vale a pena construir? Entregou o valor? |
| 🛠️ **Development** | Estamos construindo certo? |
| ⚙️ **Operations** | Está no ar e confiável? |
| 🤝 **Collaboration** | Como um segundo dev entra sem perder os gates? |
| 🧭 **Application** | Como instanciar tudo isso num cliente novo? |

Decidir → construir → manter (e o ciclo realimenta). Collaboration escala o par para um time; Application instala tudo num lugar novo.

## O que é distintivo

- **IA como par de engenharia, não assistente** — o gargalo migrou de escrever para *verificar*, e o método é feito para vencer isso.
- **Documentação que não pode mentir em silêncio** — a spec declara quais arquivos a implementam, e um check de CI derruba qualquer mudança que toque esses arquivos sem atualizar a spec.
- **O método viaja no repositório** — a IA de um colaborador se orienta sozinha ao abrir o repo.
- **Governança viva** — specs validadas pelo cliente com assinatura e versão exata; o valor é conferido *depois* da entrega, não só o "funciona".

## Onde ler (o método completo está em inglês, canônico)

- **Só quer rodar?** → `npm create cadmo`, depois [`docs/getting-started.md`](docs/getting-started.md)
- **O método inteiro em uma página** → [`docs/method.md`](docs/method.md)
- **Ver rodando** → o transcript no [README](README.md#see-it-in-action), o [`examples/`](examples/) e a [`governance/`](governance/) (os artefatos reais deste próprio repo)
- **Cético?** → [`docs/faq.md`](docs/faq.md)

---

*Tradução de cortesia — a documentação completa e canônica está em [inglês](README.md). Método de autoria e manutenção de [Tiago Torres](https://github.com/tiagotorres91) · licença CC BY 4.0.*
