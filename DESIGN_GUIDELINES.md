# SENDFLOW — DESIGN GUIDELINES

> Documento de referência visual e de experiência do usuário para o projeto Sendflow (teste técnico).
>
> **Fonte visual:** https://sendflow.com.br/  
> **Uso da referência:** inspiração de linguagem visual; não copiar logotipo, identidade proprietária, imagens promocionais ou componentes exclusivos.

---

## 1. Objetivo e prioridade

O Sendflow é uma aplicação SaaS para gerenciar conexões, contatos e mensagens Broadcast. A interface deve transmitir controle, clareza, confiabilidade e eficiência operacional.

A referência visual do site SendFlow sugere uma linguagem de alto contraste, uso predominante de superfícies escuras nas imagens do produto e amarelo vivo como cor de destaque. O painel promocional de Lead Scoring apresenta uma interface escura, tipografia clara e amarelo em elementos de navegação, destaque e ação.

**Importante sobre a referência:** o site consultado é principalmente uma página pública de marketing, não uma documentação do design system do painel autenticado. Os tokens de cor abaixo são, portanto, uma **paleta inicial aproximada para o Sendflow**, inspirada nos elementos visuais observáveis; não devem ser apresentados como valores oficiais extraídos do CSS da marca. Ajuste-os após conferir a aplicação no navegador.

### Princípios em ordem de prioridade

1. **Usabilidade antes de decoração:** o usuário precisa entender o que pode fazer e o resultado de cada ação.
2. **Legibilidade:** textos, controles e estados devem continuar claros em diferentes tamanhos de tela.
3. **Consistência:** o mesmo tipo de ação deve ter a mesma aparência e comportamento em toda a aplicação.
4. **Prevenção de erros:** validar antes de salvar, confirmar ações destrutivas e explicar ações indisponíveis.
5. **Feedback:** toda ação relevante deve comunicar carregamento, sucesso, erro ou indisponibilidade.
6. **Responsividade:** nenhuma funcionalidade pode depender de hover ou de uma tela larga.
7. **Simplicidade:** evitar excesso de cards, bordas, sombras, cores, animações e informações redundantes.

---

## 2. Direção visual

- Adotar uma interface **dark-first**, com fundo quase preto, superfícies em tons de grafite, texto claro e amarelo como destaque.
- Manter aparência profissional de SaaS administrativo: organizada, funcional, compacta sem ser apertada e orientada a dados.
- Usar o amarelo com moderação para ações primárias, seleção ativa, foco de marca e destaques importantes. Não transformar todos os elementos em amarelos.
- Reservar cores semânticas (verde, vermelho, âmbar e azul) para status e feedback; não usá-las como decoração aleatória.
- Preferir superfícies planas ou com elevação discreta. Evitar sombras grandes, gradientes chamativos, glassmorphism e excesso de efeitos.
- A interface deve parecer um painel de produto, não uma landing page de vendas. Não reproduzir seções promocionais, depoimentos, preços ou CTAs do site de referência.

---

## 3. Tokens visuais iniciais

Centralize os tokens em um tema do Material UI e em variáveis CSS. Não espalhe códigos HEX arbitrários por componentes.

### 3.1 Paleta base proposta

| Token | Valor inicial | Uso |
|---|---:|---|
| `background.default` | `#0B0B0D` | Fundo geral da aplicação |
| `background.paper` | `#151518` | Sidebar, cards, diálogos e superfícies principais |
| `surface.elevated` | `#1D1D22` | Menus, popovers e superfícies elevadas |
| `surface.hover` | `#25252B` | Hover em superfícies escuras |
| `border.default` | `#303038` | Divisórias e bordas discretas |
| `text.primary` | `#F5F5F5` | Texto principal |
| `text.secondary` | `#B5B5BD` | Descrições e metadados |
| `text.disabled` | `#85858E` | Texto realmente indisponível, mantendo contraste legível |
| `brand.primary` | `#F5D000` | Amarelo de marca, inspirado nas imagens do produto |
| `brand.hover` | `#FFDF33` | Hover de ações amarelas |
| `brand.active` | `#DDBB00` | Estado pressionado/ativo |
| `brand.subtle` | `rgba(245, 208, 0, 0.12)` | Fundo sutil de seleção ou destaque |
| `text.onBrand` | `#171717` | Texto/ícone sobre botão amarelo |

Esses HEX são **pontos de partida estimados**, não amostras oficiais garantidas do site. Verifique contraste e aparência no navegador antes de consolidar.

### 3.2 Cores semânticas

| Estado | Cor proposta | Uso |
|---|---:|---|
| Success | `#22C55E` | Operação concluída, mensagem simulada como enviada |
| Warning | `#F59E0B` | Agendada, atenção necessária |
| Error | `#EF4444` | Erro, falha de validação ou ação destrutiva |
| Info | `#60A5FA` | Informação neutra e dicas |

Não usar apenas a cor para comunicar estado. Sempre combinar cor com texto, ícone ou outro indicador visual.

### 3.3 Regras de cor

- O amarelo deve ter contraste adequado com o texto/ícone escuro usado sobre ele.
- Não usar texto branco pequeno diretamente sobre amarelo vivo; preferir `text.onBrand`.
- Não usar amarelo em grandes blocos de fundo sem uma razão funcional.
- O fundo geral deve ser o tom mais escuro; cards e superfícies devem ser distinguíveis por leve diferença de luminosidade e/ou borda.
- Evitar bordas claras em todos os elementos. Usar bordas principalmente para delimitar campos, tabelas, diálogos e agrupamentos.
- Não reduzir demais a opacidade de textos secundários ou desabilitados a ponto de torná-los ilegíveis.
- Não usar vermelho/verde como cores genéricas de botão primário; reservar para semântica de estado.

---

## 4. Tipografia

- Preferência inicial: `Inter`, com fallback `Roboto`, `Arial`, `sans-serif`. Se Inter não estiver instalada ou carregada, usar fallback sem bloquear a aplicação.
- Priorizar legibilidade sobre estilos decorativos.
- Usar pesos de forma consistente: 400 para corpo, 500 para controles e 600 para títulos e ênfases.
- Evitar textos longos em caixa alta. Usar caixa alta apenas em rótulos muito curtos quando houver benefício claro.

### Escala tipográfica inicial

| Uso | Tamanho sugerido | Peso |
|---|---:|---:|
| Título da página | 24–28 px | 600 |
| Título de seção | 18–20 px | 600 |
| Título de card/dialog | 16–18 px | 600 |
| Texto de corpo | 14–16 px | 400 |
| Label de formulário | 13–14 px | 500 |
| Metadado/ajuda | 12–13 px | 400 |
| Botão | 14 px | 600 |

- Corpo de texto não deve ficar abaixo de 14 px em uso normal, salvo metadados realmente secundários.
- Garantir altura de linha confortável: aproximadamente 1.4–1.6 para corpo e 1.2–1.35 para títulos.
- Não usar `font-size` diferente sem necessidade funcional ou hierárquica.

---

## 5. Espaçamento, alinhamento e estrutura

### 5.1 Escala de espaçamento

Usar uma escala baseada em múltiplos de 4 px:

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64 px`.

Orientações:

- 4–8 px: distância entre ícone e texto ou elementos muito relacionados.
- 12–16 px: espaçamento interno de controles e pequenos grupos.
- 16–24 px: espaçamento entre campos e elementos dentro de cards.
- 24–32 px: separação entre blocos e seções de uma página.
- 32–48 px: separação de grandes áreas quando a densidade permitir.

Não misturar valores arbitrários sem motivo. Preferir tokens de espaçamento do tema MUI ou classes Tailwind equivalentes.

### 5.2 Alinhamento

- Alinhar títulos, descrições, filtros e conteúdo principal pela mesma linha-base da página.
- Agrupar ações relacionadas e manter ordem previsível: ação primária em posição evidente; ações secundárias próximas, mas menos destacadas.
- Em formulários, manter labels, campos, mensagens de erro e ajuda alinhados verticalmente.
- Em tabelas, alinhar texto à esquerda; alinhar números e datas de forma consistente; manter ações na mesma coluna e posição.
- Não alinhar elementos apenas visualmente com margens negativas ou posicionamentos absolutos frágeis.
- Usar Flexbox e Grid para construir layouts. Reservar `position: absolute` para elementos realmente sobrepostos por natureza, como badges sobre avatares, nunca para estruturar o conteúdo principal.

### 5.3 Largura e densidade

- Usar uma largura fluida para o conteúdo principal, com limite máximo quando isso melhorar leitura e foco.
- Não esticar formulários curtos por toda a largura da tela.
- Evitar cards estreitos que quebrem labels e dados em muitas linhas.
- Evitar tabelas comprimidas; em telas pequenas, adaptar a apresentação ou oferecer rolagem horizontal claramente perceptível.
- Manter densidade confortável: dados suficientes para produtividade, sem tornar a interface visualmente congestionada.

---

## 6. Prevenção de sobreposição, cortes e quebra de layout

Esta seção é obrigatória. Antes de concluir qualquer tela, verificar visualmente que nenhum texto, ícone, botão ou campo se sobrepõe ou fica cortado.

- Não definir altura fixa em containers que tenham conteúdo textual variável. Preferir `min-height`, padding e crescimento natural.
- Em elementos flexíveis com texto, usar `min-width: 0` no item flex quando necessário para permitir que o texto quebre ou seja truncado corretamente.
- Permitir quebra de palavras longas, URLs e identificadores quando necessário (`overflow-wrap: anywhere` em conteúdos apropriados).
- Não usar `white-space: nowrap` em textos longos sem garantir espaço ou alternativa de leitura.
- Quando truncar texto com reticências, oferecer acesso ao valor completo por tooltip, popover, detalhe ou página correspondente.
- Não colocar texto longo dentro de botões. Usar rótulos curtos e consistentes.
- Garantir que ícones não empurrem labels para fora dos controles; reservar espaço e alinhar ao centro.
- Não usar posicionamento absoluto para sobrepor labels, mensagens de erro ou conteúdo de campos.
- Mensagens de validação devem ocupar espaço no fluxo do layout, sem cobrir os campos vizinhos.
- Diálogos devem respeitar a altura da viewport; em conteúdo longo, rolar o corpo do diálogo, não esconder os botões de ação.
- Menus, popovers e tooltips não podem ficar cortados por containers com `overflow: hidden`.
- Ao usar tabelas, verificar nomes longos, telefones, datas, status e menus de ação.
- Não esconder informações essenciais em hover: o conteúdo principal deve continuar compreensível em touch e teclado.

Checklist técnico quando houver problemas de layout:

- Verificar `min-width: 0` e `min-height: 0` em layouts flex/grid.
- Rever `overflow`, `white-space`, `text-overflow`, `word-break` e `flex-shrink`.
- Evitar larguras e alturas fixas que não se adaptem ao conteúdo.
- Não corrigir um problema local introduzindo sobreposição ou quebra em outro breakpoint.

---

## 7. Layout da aplicação

### 7.1 Estrutura de desktop

- Preferir sidebar de navegação persistente e área principal de conteúdo.
- Sidebar pode ser recolhível, mas deve preservar rótulos acessíveis e indicar claramente a página ativa.
- Cabeçalho da página deve conter título, descrição opcional e ação principal quando aplicável.
- Manter ações secundárias em menus ou áreas consistentes.
- Evitar excesso de barras superiores, cards decorativos e painéis redundantes.

Dimensões iniciais sugeridas, ajustáveis após validação:

- Sidebar expandida: aproximadamente 240–264 px.
- Topbar: aproximadamente 56–64 px.
- Padding da área principal: 24–32 px em desktop; 16–24 px em tablet; 16 px em mobile.

### 7.2 Responsividade

- Desktop: sidebar e tabelas completas quando houver espaço.
- Tablet: permitir sidebar recolhida e reorganizar filtros/ações em múltiplas linhas.
- Mobile: usar navegação adaptada, formulários em uma coluna e cards/listas no lugar de tabelas excessivamente comprimidas.
- Não depender de hover para revelar ações essenciais.
- Botões e alvos de toque devem ter dimensão confortável; preferir pelo menos 40–44 px de altura/largura para controles principais.
- Garantir que diálogos caibam na tela e que seus botões permaneçam acessíveis.
- Verificar no mínimo larguras próximas de 360 px, 768 px, 1024 px e 1440 px.

---

## 8. Estados interativos e feedback

Todo elemento interativo precisa comunicar seu estado. Não implementar apenas o estado padrão.

### 8.1 Estados obrigatórios

Para botões, links, itens de navegação, campos e controles, considerar quando aplicável:

- Default: aparência normal.
- Hover: feedback visual perceptível em dispositivos com ponteiro.
- Focus-visible: indicação clara de foco via teclado.
- Active/pressed: feedback ao pressionar.
- Disabled: aparência claramente indisponível, sem parecer apenas um botão normal.
- Loading: indicar processamento e impedir submissões duplicadas quando necessário.
- Error: apresentar erro próximo ao campo ou contexto correspondente.
- Success: confirmar a conclusão de uma ação relevante.

### 8.2 Hover

- O hover deve melhorar a visibilidade e indicar interatividade, não ser apenas decorativo.
- Botões: alterar discretamente luminosidade, fundo, borda ou elevação; manter contraste do label.
- Itens de navegação: realçar fundo e/ou cor do ícone/texto; manter o estado ativo diferente do hover.
- Linhas de tabela: usar fundo sutil no hover para facilitar acompanhar a linha; não tornar a linha inteira clicável sem necessidade.
- Cards clicáveis: alterar borda/fundo e cursor; oferecer também foco visível.
- Ícones de ação: alterar cor ou fundo e apresentar tooltip com nome da ação quando o significado não for óbvio.
- Usar transições curtas e discretas, em geral 120–200 ms.
- Não depender somente de mudança de cor sutil. Combinar com contraste, borda ou fundo quando necessário.
- Em telas touch, garantir que a ação seja visível sem hover.

### 8.3 Focus-visible e teclado

- Todo controle interativo deve ser acessível por teclado.
- Exibir foco claramente visível, com contorno ou realce que não dependa apenas da cor do texto.
- Não remover `outline` sem implementar alternativa equivalente.
- A ordem de tabulação deve seguir a ordem visual e lógica.
- Escape deve fechar diálogos/menus quando apropriado; Enter e Space devem acionar controles de acordo com seu papel semântico.

### 8.4 Botões desabilitados

- Um botão indisponível deve parecer claramente diferente de um botão ativo: reduzir destaque, alterar fundo/texto e remover indicação de interação.
- Não usar somente opacidade muito baixa, pois o texto pode ficar ilegível.
- Não deixar um botão com aparência ativa se a ação não pode ser executada.
- Sempre que o motivo não for autoexplicativo, informar por texto auxiliar ou tooltip: por exemplo, “Selecione ao menos um contato para continuar”.
- Se a ação depende de um campo obrigatório, indicar o que falta e como habilitar a ação.
- Em Material UI, `Tooltip` não dispara diretamente sobre um elemento `disabled` em alguns cenários; envolver o botão desabilitado em um elemento como `span` quando necessário, mantendo acessibilidade.
- Não desabilitar ações apenas para esconder uma falha de validação: explicar o requisito e, quando possível, permitir que o usuário clique para receber a mensagem de validação.

### 8.5 Loading e prevenção de duplicidade

- Exibir progresso em ações que possam demorar.
- Desabilitar temporariamente o botão de envio enquanto a mesma operação estiver em andamento.
- Evitar múltiplos envios por cliques repetidos.
- Usar skeletons em listas e painéis quando a estrutura da tela já for conhecida; usar spinner em operações localizadas.
- Não substituir a tela inteira por um spinner se apenas uma seção estiver carregando.

### 8.6 Feedback de sucesso e erro

- Usar Snackbar/Toast para confirmações breves, como “Contato atualizado”.
- Usar mensagens de erro úteis, em linguagem clara, sem expor detalhes internos ou stack traces.
- Para erro de formulário, apresentar a mensagem junto ao campo correspondente.
- Para falha geral, indicar o que ocorreu e, quando apropriado, oferecer uma ação de recuperação.
- Não comunicar “mensagem entregue” ou “WhatsApp enviado”: o projeto apenas simula o processamento. Usar termos como “Envio simulado como concluído” ou status “Enviada (simulação)” quando necessário para evitar interpretação enganosa.

---

## 9. Componentes e padrões de interface

### 9.1 Botões

- Usar uma hierarquia clara: primary, secondary/outlined, text e destructive.
- Uma página normalmente deve ter apenas uma ação primária visualmente dominante por contexto.
- Usar verbos específicos: “Criar conexão”, “Salvar contato”, “Agendar mensagem”. Evitar “OK” ou “Enviar” quando o resultado não estiver claro.
- Botões com ícone devem manter alinhamento e espaçamento consistente.
- Ações destrutivas devem ter aparência de perigo e confirmação quando forem irreversíveis.

### 9.2 Campos e formulários

- Todo campo deve ter label persistente; não usar placeholder como único rótulo.
- Diferenciar claramente campos obrigatórios e opcionais.
- Manter mensagens de ajuda e erro próximas ao campo.
- Não apagar o conteúdo digitado após falha de validação ou de rede.
- Desabilitar o botão de submissão durante processamento para evitar duplicidade.
- Agrupar campos relacionados e manter espaçamento uniforme.
- Para telefone, indicar formato esperado e normalizar dados sem surpreender o usuário.
- Para data/hora, apresentar explicitamente o fuso/horário local quando isso for relevante.

### 9.3 Cards e painéis

- Usar cards quando eles agruparem informações relacionadas ou fornecerem hierarquia útil.
- Evitar aninhar vários cards sem necessidade.
- Manter padding interno consistente, normalmente 16–24 px.
- Não usar sombra forte em todos os cards; preferir diferença de superfície e borda sutil.

### 9.4 Tabelas e listas

- Manter cabeçalho claro, alinhamento consistente e altura de linha suficiente.
- Colunas devem priorizar as informações mais úteis.
- Ações de linha devem ficar agrupadas e ter tooltip/label acessível.
- Em mobile, converter para cards/listas ou permitir scroll horizontal com indicação clara.
- Truncar apenas quando necessário e oferecer acesso ao texto completo.
- Incluir paginação ou limite de resultados quando a lista puder crescer.
- Oferecer estado vazio com explicação e ação útil, por exemplo “Nenhum contato cadastrado” + “Adicionar contato”.

### 9.5 Dialogs e confirmação

- Título direto e descrição curta quando a ação tiver consequências.
- Botões devem ter rótulos claros; manter cancelar como ação secundária.
- Para exclusão, indicar o que será removido e se existem dados relacionados.
- Não abrir diálogo para ações simples que não precisam de confirmação.
- Em mobile, usar largura adaptada e garantir que ações fiquem acessíveis.

### 9.6 Status e badges

- Sempre combinar cor e texto: “Agendada”, “Enviada”, “Falhou” etc.
- Usar cores semânticas consistentes em toda a aplicação.
- Não depender exclusivamente da cor para distinguir estados.
- Manter badges compactas e legíveis; não usar badges para toda informação comum.

### 9.7 Ícones

- Usar preferencialmente Material UI Icons, já presente no projeto.
- Usar ícone junto a texto quando a ação não for universalmente reconhecível.
- Ícone isolado deve ter `aria-label`/tooltip e alvo de interação adequado.
- Manter tamanho, espessura e alinhamento consistentes.
- Não usar emoji como substituto de ícone funcional.

---

## 10. Padrões específicos do Sendflow

### 10.1 Navegação

Itens principais sugeridos:

- Visão geral (somente se houver conteúdo útil suficiente).
- Conexões.
- Broadcasts.

A área de contatos deve ser contextual à conexão selecionada ou acessível de forma clara a partir dela. Não criar navegação redundante.

### 10.2 Conexões

- Apresentar nome da conexão e ações disponíveis.
- Destacar a ação “Nova conexão”.
- Informar claramente quando ainda não houver conexões.
- Antes de excluir, explicar que contatos e broadcasts associados poderão ser removidos conforme a regra de negócio implementada.

### 10.3 Contatos

- Mostrar nome e telefone com legibilidade.
- Deixar evidente a conexão à qual os contatos pertencem.
- Oferecer pesquisa e ação para adicionar contato.
- Confirmar exclusão quando apropriado.

### 10.4 Broadcasts

O fluxo de criação deve ser claro e sequencial:

1. Selecionar conexão.
2. Selecionar um ou mais contatos daquela conexão.
3. Escrever a mensagem.
4. Escolher envio imediato ou agendamento.
5. Se agendado, definir data e horário futuros.
6. Revisar os dados e confirmar a operação.

Regras de UX:

- Desabilitar ou orientar a seleção de contatos enquanto nenhuma conexão estiver selecionada.
- Mostrar quantidade de contatos selecionados.
- Permitir limpar a seleção.
- Não perder o texto da mensagem ao alternar opções de agendamento.
- Validar conteúdo vazio, ausência de destinatários e data passada.
- Explicar o que falta quando a ação principal estiver indisponível.
- Deixar explícito que o disparo é uma simulação, não uma entrega real por WhatsApp/SMS.

### 10.5 Histórico de mensagens

- Oferecer filtros claros para “Todas”, “Agendadas” e “Enviadas”, conforme o escopo implementado.
- Exibir mensagem/resumo, conexão, quantidade de destinatários, data de criação, data agendada ou data da simulação e status.
- Manter ações editar/excluir em posição previsível.
- Atualizar status em tempo real quando o backend processar uma mensagem agendada.
- Não fazer o usuário interpretar `sent` como confirmação de entrega por um provedor externo.

---

## 11. Acessibilidade e contraste

- Buscar conformidade WCAG 2.2 nível AA para os fluxos essenciais.
- Texto normal deve atingir contraste de pelo menos 4.5:1 em relação ao fundo; texto grande, pelo menos 3:1.
- Elementos visuais necessários para identificar controles e estados devem ter contraste adequado com superfícies adjacentes.
- Não usar apenas cor para comunicar erro, sucesso, seleção ou status.
- Usar labels associados aos campos, nomes acessíveis em botões de ícone e texto alternativo em imagens informativas.
- Garantir navegação por teclado e foco visível.
- Respeitar `prefers-reduced-motion`; animações não devem ser necessárias para compreender uma ação.
- Não comunicar informação importante apenas por tooltip, pois ela pode não estar disponível em touch.

---

## 12. Animações e movimento

- Preferir transições sutis e rápidas, normalmente 120–200 ms.
- Não animar continuamente elementos sem necessidade.
- Evitar deslocamentos grandes, zoom excessivo, parallax ou animações que atrasem tarefas.
- Respeitar preferência por movimento reduzido.
- Feedback de loading deve ser claro, mas não distrair.

---

## 13. Uso de Material UI e Tailwind CSS

- Material UI é a biblioteca principal para controles e componentes: Button, TextField, Select, Dialog, Menu, Table, Tooltip, Snackbar etc.
- Tailwind CSS deve ser usado principalmente para layout, flexbox/grid, espaçamento e responsividade.
- Definir paleta, tipografia, radius e componentes recorrentes no tema MUI.
- Evitar sobrescrever o mesmo estilo simultaneamente por `sx`, CSS global e muitas classes Tailwind.
- Não usar valores aleatórios de cor, padding, radius e sombra quando houver token correspondente.
- Manter a ordem de camadas CSS configurada para integração MUI + Tailwind no projeto.
- Antes de criar um componente novo, verificar se já existe um componente compartilhado equivalente.

---

## 14. Checklist obrigatório antes de concluir uma tela

O agente deve revisar os itens abaixo antes de considerar uma tela concluída:

### Hierarquia e consistência
- [ ] O título e a finalidade da tela são claros?
- [ ] A ação principal é fácil de localizar?
- [ ] O estilo é consistente com as outras telas?
- [ ] Os componentes existentes foram reutilizados quando apropriado?

### Espaçamento e alinhamento
- [ ] Os elementos respeitam a escala de espaçamento?
- [ ] Títulos, conteúdo, filtros e ações estão alinhados?
- [ ] Não há áreas excessivamente apertadas ou espaços vazios sem função?

### Integridade visual
- [ ] Nenhum texto está sobreposto, cortado ou ilegível?
- [ ] Textos longos quebram ou têm truncamento com acesso ao conteúdo completo?
- [ ] Botões e ícones não se sobrepõem a labels ou campos?
- [ ] Dialogs e menus cabem na viewport e não ficam cortados?
- [ ] Não existem barras de rolagem inesperadas?

### Estados e interação
- [ ] Hover é perceptível sem ser exagerado?
- [ ] Focus-visible está claro?
- [ ] Botões desabilitados parecem indisponíveis e explicam o motivo quando necessário?
- [ ] Loading impede submissões duplicadas?
- [ ] Sucesso e erro são comunicados claramente?
- [ ] Estados vazios e de erro têm orientação útil?

### Responsividade e acessibilidade
- [ ] A tela foi verificada em desktop, tablet e mobile?
- [ ] Nenhuma ação essencial depende de hover?
- [ ] Controles têm alvos de toque confortáveis?
- [ ] Contraste, labels e navegação por teclado foram considerados?

### Semântica do produto
- [ ] Status e datas estão apresentados de forma compreensível?
- [ ] O usuário entende o efeito da ação antes de confirmá-la?
- [ ] A interface deixa claro que o envio de Broadcast é uma simulação?

Se algum item aplicável falhar, corrigir antes de finalizar a tarefa. Se não for possível corrigir, explicar a limitação no resumo da implementação.

---

## 15. Instruções adicionais do proprietário do projeto

Use esta seção para adicionar novas preferências visuais ou decisões específicas sem reescrever todo o documento.

- Preferências adicionais: [preencher]
- Componentes de referência: [preencher]
- Padrões que devem ser evitados: [preencher]
- Ajustes futuros na paleta: [preencher]

---

## 16. Referências

- Site de referência: https://sendflow.com.br/
- Integração MUI + Tailwind CSS: https://mui.com/material-ui/integrations/tailwindcss/tailwindcss-v4/
- Material UI theming: https://mui.com/material-ui/customization/theming/
- WCAG 2.2: https://www.w3.org/TR/WCAG22/

