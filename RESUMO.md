# O que foi implementado (branch `feat/painel-prestador`)

## Telas novas do Prestador (baseadas no Stitch)
- **Painel do Prestador**: saldo e saque via Pix; pedidos de turistas com Aceitar/Recusar; agenda confirmada com Concluir; meus passeios com Disponível/Pausado e Editar.
- **Novo Passeio**: criar e editar passeios, com envio de foto ou foto pronta.
- **Verificação Cadastur**: documento (frente e verso), número Cadastur, credencial, selfie e termo; envio para análise; simulação de aprovação.
- **Mensagens e Chat do Prestador**: lista de conversas com contador de não lidas e resposta aos turistas.

## Interação Turista ↔ Prestador
- A reserva paga vira **pedido pendente** ("Aguardando guia") até o guia responder.
- **Aceitar**: a reserva fica confirmada, o voucher é liberado e o turista recebe uma mensagem automática no chat.
- **Recusar**: o turista vê um aviso com o reembolso.
- **Concluir**: o valor entra no saldo do guia e o turista pode avaliar.
- **Chat real nos dois sentidos**. O bot de respostas automáticas fica só para guias sem conta.
- Passeios criados pelo guia aparecem no Explorar. Os pausados somem do Explorar e não podem ser comprados.
- As telas se atualizam sozinhas, sem recarregar.

## Login e sessão
- Seletor "Sou turista / Sou prestador" no login, e redirecionamento conforme o papel da conta.
- Sessão por aba: o id do usuário logado é enviado automaticamente à API, então o app deixou de usar sempre o usuário 1.
- Contas de prestador (Zé, Chico e Clenilda) e dados de exemplo (pedidos, saldo e conversa).

## Backend
- Módulo novo `09_prestador`: painel, pedidos, saque, passeios, upload de arquivos, Cadastur e chat do guia.
- Banco: novas colunas e tabelas (`withdrawals`, `cadastur_verifications`), status `pendente`/`recusadas` e pasta `uploads/`.

## Correções
- O preço da reserva vem do banco, não do app.
- Códigos de reserva sem colisão.
- A reinicialização do backend não sobrescreve mais os passeios editados.
- A avaliação recebia o id errado da experiência.
- Alertas e logout não funcionavam na web.
- O login e o pagamento não fingem mais sucesso quando o servidor está fora do ar.
- O backend aceita conexões por IPv6.

## Ajustes (segunda rodada)
- **Filtro por nível** (Leve, Moderado, Difícil) no Explorar e selo de nível nos cards.
- **Tela de Notificações** do turista, aberta pelo sino do Explorar ou pelo Perfil. Mostra a confirmação do Pix, o pedido aceito ou recusado, as mensagens do guia e o passeio concluído, com contador de não lidas.
- **Cartão de crédito removido**: o pagamento é só via Pix, no app e no servidor.
- **Avaliação em 2 etapas**: primeiro o guia (nota, destaques e comentário), depois a experiência. A nota do guia entra na média dele.
- **Novo Passeio (serviços)**: seletor de **nível da trilha** e "O que está incluído" em **tags**: as tags prontas já usadas no app, mais a opção de criar novas.

## Utilitários
- `iniciar.bat` (sobe backend e app e abre o navegador) e `encerrar.bat` (derruba tudo).
- `TESTE.md` com o roteiro de testes.
