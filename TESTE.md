# Roteiro de teste: telas do Prestador e interação Turista ↔ Prestador

Este roteiro cobre o que foi implementado na branch `feat/painel-prestador`:

- **Telas do Prestador** (baseadas no Stitch): Painel do Prestador, Novo Passeio, Verificação Cadastur, Mensagens e Chat.
- **Interação cliente ↔ serviço**: pedidos de reserva

  ```

  ```

  que o guia aceita ou recusa, chat nos dois sentidos, passeios criados pelo guia aparecendo para o turista, conclusão do passeio, saldo e saque.

---

## 1. Preparação

### Iniciar

Dê dois cliques em **`iniciar.bat`**, na pasta do projeto. Ele:

1. instala as dependências na primeira vez;
2. abre as janelas **QuixaTour Backend** (porta 3001) e **QuixaTour App** (porta 8081);
3. abre o navegador em `http://localhost:8081`.

Na primeira abertura, o app pode levar alguns segundos para compilar.

### Encerrar

Dê dois cliques em **`encerrar.bat`**. Ele fecha as janelas e libera as portas 3001 e 8081.

### Contas de teste (senha de todas: `123456`)


| Papel     | E-mail                                   | Observação                                                              |
| --------- | ---------------------------------------- | ------------------------------------------------------------------------- |
| Turista   | `seu@email.com`                          | Turista padrão                                                           |
| Prestador | `ze@quixatour.com`                       | Guia Zé, Cadastur**aprovado**, já tem pedidos e saldo                   |
| Prestador | `chico@quixatour.com`                    | Instrutor Chico Asas, Cadastur**aprovado**                                |
| Prestador | `clenilda@quixatour.com`                 | Guia Clenilda, Cadastur**não enviado** (use para testar a verificação) |
| Turista   | `mariana@email.com` / `carlos@email.com` | Turistas que já fizeram pedidos de exemplo                               |

### Duas abas = dois usuários

Cada aba do navegador guarda o seu próprio login. Para testar a interação, use:

- **Aba A**: turista
- **Aba B**: prestador

Na tela de login, o seletor **"Sou turista / Sou prestador"** preenche a conta de teste automaticamente. Para quem entra, a conta define o destino: prestador vai para o Painel, turista vai para o Explorar.

### Atualização automática

Não é preciso recarregar a página: as telas buscam novidades sozinhas.


| Tela                            | Intervalo |
| ------------------------------- | --------- |
| Painel do Prestador             | 8 s       |
| Minhas Reservas (turista)       | 8 s       |
| Chat do turista                 | 4 s       |
| Lista de mensagens do prestador | 5 s       |
| Chat do prestador               | 3 s       |

---

## 2. Teste 1: Login e Painel do Prestador

**Aba B:** escolha **Sou prestador** e entre com `ze@quixatour.com`.


| #   | Ação                    | Resultado esperado                                                                                                                                 |
| --- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1 | Fazer login               | Abre o**Painel do Prestador** com o selo "Guia Credenciado" e "Olá, Zé"                                                                          |
| 1.2 | Ver o card de saldo       | **Saldo para Saque: R$ 374,00** (soma dos passeios concluídos)                                                                                    |
| 1.3 | Ver "Pedidos de Turistas" | 2 pedidos com o contador**2**: **Carlos** (Trilha Galinha Choca, 3 pessoas, R$ 228,00) e **Mariana** (Trilha Pedra do Racha, 2 pessoas, R$ 130,00) |
| 1.4 | Ver "Meus Passeios"       | Passeios do Zé com foto, preço, nº de reservas, botão**Disponível/Pausado** e **Editar**                                                      |
| 1.5 | Ver a barra inferior      | Abas Painel, Mensagens (com contador de não lidas), Novo passeio e Cadastur                                                                       |

---

## 3. Teste 2: Turista reserva, prestador aceita (fluxo principal)


| #   | Aba | Ação                                                                               | Resultado esperado                                                                                                                      |
| --- | --- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1 | A   | Entrar como**turista** (`seu@email.com`)                                             | Abre o Explorar                                                                                                                         |
| 2.2 | A   | Abrir**Trilha Galinha Choca & Açude do Cedro** → Reservar → escolher Pix → pagar | Aviso:*"Seu pedido foi enviado ao guia…"* e a tela vai para **Minhas Reservas**                                                        |
| 2.3 | A   | Ver o card da reserva                                                                | Selo amarelo**"Aguardando guia"**. Sem botão "Ver Voucher": no lugar, aparece *"O voucher é liberado assim que Guia Zé confirmar…"* |
| 2.4 | B   | Esperar até 8 s no Painel do Zé                                                    | O novo pedido aparece em**Pedidos de Turistas** e o contador aumenta                                                                    |
| 2.5 | B   | Clicar em**Aceitar**                                                                 | Mensagem*"Passeio confirmado com …!"*. O pedido sai da lista e vai para **Agenda Confirmada**                                          |
| 2.6 | A   | Esperar até 8 s em Minhas Reservas                                                  | O selo muda para**"Confirmado"** e o botão **Ver Voucher** aparece                                                                     |
| 2.7 | A   | Abrir o**Chat** do card da reserva                                                   | Há uma mensagem automática do guia:*"✅ Seu pedido #QX-… foi confirmado!"*. O topo mostra o passeio com o status **Confirmado**      |

**Validação de segurança (opcional):** o preço é calculado no servidor. Mesmo que alguém altere o valor no app, a reserva é gravada com o preço real do passeio.

---

## 4. Teste 3: Prestador recusa um pedido


| #   | Aba | Ação                                                                | Resultado esperado                                                                                                            |
| --- | --- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 3.1 | A   | Fazer uma nova reserva (ex.:**Trilha Pedra do Racha ao Pôr do Sol**) | Aparece como "Aguardando guia"                                                                                                |
| 3.2 | B   | No Painel, clicar em**Recusar** no novo pedido → confirmar           | *"Pedido de … recusado. O reembolso foi solicitado."*                                                                        |
| 3.3 | A   | Esperar até 8 s em Minhas Reservas                                   | Surge um aviso vermelho no topo de**Próximas**: *"Pedido #QX-… recusado por Guia Zé"*, com o motivo e o valor do reembolso |
| 3.4 | A   | Abrir o chat com o Guia Zé                                           | Há uma mensagem do guia explicando a recusa e o reembolso                                                                    |

---

## 5. Teste 4: Chat nos dois sentidos


| #   | Aba | Ação                                                          | Resultado esperado                                                                                      |
| --- | --- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 4.1 | A   | No chat com o Guia Zé, enviar*"Qual o nível de dificuldade?"* | A mensagem aparece.**Não** há resposta automática, porque o Zé é uma pessoa com conta de prestador |
| 4.2 | B   | Ver a aba**Mensagens** da barra inferior                        | O contador vermelho de não lidas aumenta                                                               |
| 4.3 | B   | Abrir**Mensagens**                                              | A conversa com o turista aparece no topo, em negrito, com o contador                                    |
| 4.4 | B   | Abrir a conversa e responder*"É moderado, vamos com calma!"*   | A resposta aparece em laranja, à direita                                                               |
| 4.5 | A   | Esperar até 4 s no chat                                        | A resposta do guia aparece sozinha                                                                      |

Extra: na lista de Mensagens do Zé já existe uma conversa de exemplo da **Mariana**, com uma pergunta sem resposta.

---

## 6. Teste 5: Concluir o passeio, saldo e saque


| #   | Aba | Ação                                                                                    | Resultado esperado                                                                  |
| --- | --- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 5.1 | B   | Em**Agenda Confirmada**, clicar em **Concluir** no passeio aceito no Teste 2 → confirmar | O passeio sai da agenda e o**Saldo para Saque** aumenta pelo valor da reserva       |
| 5.2 | A   | Em Minhas Reservas, aba**Concluídas**                                                    | A reserva aparece lá e pode ser**avaliada** (estrelas)                             |
| 5.3 | A   | Chat com o guia                                                                           | Mensagem*"Obrigado pelo passeio…"* pedindo a avaliação                           |
| 5.4 | B   | Clicar em**Sacar via Pix** → confirmar                                                   | Aviso*"Saque de R$ … enviado via Pix com sucesso!"* e o saldo vai para **R$ 0,00** |
| 5.5 | B   | Clicar em**Sacar via Pix** de novo                                                        | Aviso*"Sem saldo"*: não dá para sacar duas vezes                                  |

---

## 7. Teste 6: Criar, editar e pausar um passeio


| #   | Aba | Ação                                                                                                                                       | Resultado esperado                                                                                                        |
| --- | --- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 6.1 | B   | Barra inferior →**Novo passeio**                                                                                                            | Abre o formulário "Novo Passeio"                                                                                         |
| 6.2 | B   | Clicar em**Publicar Passeio** sem preencher nada                                                                                             | Erro de validação (ex.:*"Informe o nome do passeio."*)                                                                  |
| 6.3 | B   | Clicar na área da foto e escolher uma imagem do computador                                                                                  | A foto aparece, com a legenda*"Foto enviada por você"*. Também dá para usar as fotos prontas **Trilha / Voo / Chalé** |
| 6.4 | B   | Preencher: Nome*"Trilha da Pedra do Cruzeiro"*, Categoria **Trilhas**, Preço **60**, Ponto de encontro, Descrição → **Publicar Passeio** | Aviso*"Passeio publicado!"* e o passeio aparece em **Meus Passeios**                                                      |
| 6.5 | A   | Ir ao**Explorar** (categoria Todos ou Trilhas)                                                                                               | O passeio novo aparece, com a foto enviada                                                                                |
| 6.6 | B   | Em Meus Passeios, clicar em**Editar** no passeio novo, mudar o preço para **70** → **Salvar Alterações**                                 | O preço é atualizado no painel e no Explorar do turista                                                                 |
| 6.7 | B   | Desligar o botão do passeio (**Pausado**)                                                                                                   | O rótulo muda para "Pausado"                                                                                             |
| 6.8 | A   | Recarregar o Explorar                                                                                                                        | O passeio**não aparece mais**                                                                                            |
| 6.9 | B   | Ligar de novo (**Disponível**)                                                                                                              | O passeio volta a aparecer para o turista                                                                                 |

Se o turista estiver na tela de pagamento de um passeio que acabou de ser pausado, o pagamento é recusado com *"Este passeio está pausado pelo guia no momento."*

---

## 8. Teste 7: Verificação Cadastur

**Aba B:** saia do painel (ícone de sair, no canto superior direito) e entre com `clenilda@quixatour.com`.


| #    | Ação                                                                                                      | Resultado esperado                                                                                 |
| ---- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 7.1  | Ver o Painel                                                                                                | No lugar de "Guia Credenciado", aparece o selo vermelho**"Verifique seu Cadastur"**                |
| 7.2  | Clicar no selo (ou na aba**Cadastur**)                                                                      | Abre a tela**Verificação Cadastur** em "Etapa 1 de 3 • 0% concluído"                           |
| 7.3  | Clicar em**Enviar para Verificação Oficial** sem nada                                                     | Erro:*"Envie a frente e o verso do documento de identidade."*                                      |
| 7.4  | Enviar uma imagem em**Frente do Documento** e outra em **Verso do Documento**                               | Cada linha mostra o nome e o tamanho do arquivo, com a opção**Alterar**. O progresso sobe        |
| 7.5  | Digitar o número Cadastur (ex.:`06.049182.20-8`) e clicar fora do campo                                    | O número fica salvo como rascunho                                                                 |
| 7.6  | (Opcional) Enviar a**Carteira Profissional**                                                                | A imagem aparece no card                                                                           |
| 7.7  | **Abrir Câmera para Selfie**: no computador, abre a escolha de arquivo; no celular, abre a câmera frontal | Mostra*"Selfie enviada • Refazer"*                                                                |
| 7.8  | Marcar o**Compromisso Ambiental & Ética Sertaneja**                                                        | A caixa fica marcada                                                                               |
| 7.9  | Clicar em**Enviar para Verificação Oficial**                                                              | Status**"Em análise"**, campos bloqueados e o selo do Painel muda para **"Cadastur em análise"** |
| 7.10 | Clicar em**Simular aprovação (teste)** → confirmar                                                       | Status**"Verificado!"**, com 100% de progresso e o selo **"Guia Credenciado"** no Painel           |

O rascunho é salvo a cada envio: se você sair da tela e voltar, os arquivos continuam lá.

---

## 9. Teste 8: Outro guia não acessa pedidos do Zé


| #   | Ação                                     | Resultado esperado                                                                                    |
| --- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| 8.1 | Na aba B, entrar como`chico@quixatour.com` | O Painel do Chico mostra só os pedidos e passeios**dele** (ex.: pedido de **Carlos** para Rapel)     |
| 8.2 | Comparar com o painel do Zé               | Os pedidos do Zé não aparecem para o Chico. A API também bloqueia se outro guia tentar aceitá-los |

---

## 9.1 Teste 9: Ajustes (níveis, notificações, Pix, avaliação e tags)

| #    | Aba | Ação | Resultado esperado |
| ---- | --- | ---- | ------------------ |
| 9.1  | A   | No Explorar, abrir **Filtros** → seção **Nível de dificuldade** → **Difícil** → Aplicar | Só aparece **Rapel & Escalada nos Monólitos**, e o filtro "Nível Difícil" aparece acima da lista. **Leve** mostra 4 passeios e **Moderado** mostra a Trilha Galinha Choca |
| 9.2  | A   | Ver os cards do Explorar | As trilhas e aventuras mostram o selo colorido **Nível Leve / Moderado / Difícil** |
| 9.3  | A   | Reservar um passeio e ir ao pagamento | Só existe a opção **Pix** (o cartão de crédito foi removido) |
| 9.4  | A   | Pagar com Pix e tocar no **sino** da barra inferior do Explorar | O sino mostra um contador. A tela **Notificações** traz *"Pagamento Pix confirmado"* com o código do pedido |
| 9.5  | B   | Aceitar o pedido, responder no chat e depois **Concluir** o passeio | — |
| 9.6  | A   | Abrir **Notificações** (pelo sino ou por **Perfil → Notificações**) | Aparecem *"Reserva confirmada pelo guia"*, *"Nova mensagem de Guia Zé"* e *"Passeio concluído — avalie!"*, com o selo **Novo**. Ao sair e voltar, o contador zera |
| 9.7  | A   | Tocar numa notificação | Uma de mensagem abre o chat com o guia. As outras abrem Minhas Reservas |
| 9.8  | A   | Em Minhas Reservas → **Concluídas** → avaliar o passeio | **Etapa 1 – Guia**: estrelas, destaques (Pontual, Atencioso…) e comentário → **Próximo: avaliar experiência** |
| 9.9  | A   | **Etapa 2 – Experiência**: estrelas e depoimento → **Enviar Avaliação** | *"Avaliação enviada!"*. A seta de voltar na etapa 2 retorna para a etapa 1 |
| 9.10 | B   | **Novo passeio** → escolher a categoria **Trilhas** | O campo **Nível da trilha** vem em *Moderado*. Escolha Leve, Moderado, Difícil ou *Não se aplica* |
| 9.11 | B   | Trocar a categoria para **Restaurantes** | O nível muda sozinho para *Não se aplica* |
| 9.12 | B   | Em **O que está incluído**, tocar nas **tags prontas** (ex.: Água mineral, Seguro aventura) | As tags escolhidas sobem para a lista do passeio. Tocar de novo remove |
| 9.13 | B   | Digitar *"Café da manhã"* no campo **Criar nova tag** → **+** | A tag nova entra no passeio |
| 9.14 | B   | Publicar e, na Aba A, filtrar pelo nível escolhido | O passeio novo aparece no filtro, e os detalhes mostram as tags como itens incluídos |

---

## 10. Voltar os dados ao estado inicial

Os testes alteram o banco `backend/quixatour.db`. Para recomeçar do zero:

1. Rode **`encerrar.bat`**.
2. No terminal, dentro da pasta do projeto:
   ```
   git checkout -- backend/quixatour.db
   ```
3. Apague a pasta `backend/uploads` (fotos e documentos enviados nos testes).
4. Rode **`iniciar.bat`**. Os pedidos, contas e saldo de exemplo são recriados.

---

## 11. Problemas comuns


| Sintoma                                                | O que fazer                                                                                                        |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| *"Não foi possível conectar ao servidor"* no login   | O backend não está rodando: veja a janela**QuixaTour Backend** ou rode `iniciar.bat`                             |
| Erro*"NetworkError when attempting to fetch resource"* | O app (Expo) caiu: rode`encerrar.bat`, depois `iniciar.bat`, e recarregue a página (F5)                           |
| As duas abas mostram o mesmo usuário                  | Faça login de novo na aba. Cada aba guarda o próprio login, mas uma aba**duplicada** copia a sessão da original |
| Porta 3001 ou 8081 "em uso"                            | Rode`encerrar.bat`                                                                                                 |
| A página fica em branco na primeira vez               | O Expo ainda está compilando: aguarde alguns segundos e recarregue                                                |
