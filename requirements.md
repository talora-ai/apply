# Requisitos do Talora Apply

## 1. Finalidade

Este documento registra os requisitos funcionais, regras de negócio, requisitos não funcionais e critérios iniciais de aceite do Talora Apply.

## 2. Atores

### Usuário

Pessoa que envia o currículo, configura preferências, inicia pesquisas e acompanha vagas e candidaturas.

### Administrador

Responsável pela operação da plataforma, provedores, planos, limites, falhas e auditoria.

### Bot

Componente automatizado que processa currículos, pesquisa vagas e executa candidaturas autorizadas.

### Serviço de IA

Componente que interpreta, classifica, explica resultados e produz sugestões.

## 3. Regras de negócio

### RN-001 — Pesquisa sob demanda

O Talora Apply somente deverá pesquisar vagas quando o usuário iniciar uma pesquisa.

### RN-002 — Currículo obrigatório

Uma pesquisa não poderá ser classificada sem que o usuário possua um currículo processado e válido.

### RN-003 — Compatibilidade

Cada relação candidato-vaga deverá possuir uma pontuação e uma explicação.

### RN-004 — Faixas de pontuação

- abaixo de 70%: baixa compatibilidade;
- de 70% até 90%: recomendação;
- acima de 90%: elegível para candidatura automática.

### RN-005 — Autorização

A candidatura automática somente poderá ocorrer após autorização explícita do usuário.

### RN-006 — Sites permitidos

O MVP somente poderá realizar candidaturas em sites que não exijam login.

### RN-007 — Proteções

O bot não deverá contornar CAPTCHA, MFA, login ou mecanismos de proteção.

### RN-008 — Duplicidade

O mesmo usuário não poderá se candidatar mais de uma vez à mesma vaga.

### RN-009 — Dados obrigatórios

Se informações obrigatórias estiverem ausentes, a candidatura deverá ser interrompida e marcada para ação manual.

### RN-010 — Vaga disponível

Uma candidatura somente poderá ser enviada se a vaga continuar disponível no momento da execução.

### RN-011 — Cadastro

O cadastro cria a conta, mas não retorna token nem autentica automaticamente.

### RN-012 — Login

Somente o login deverá emitir o token Sanctum utilizado pelos clientes.

### RN-013 — Fidelidade do currículo

A IA não poderá inventar experiências, resultados, formação ou habilidades.

### RN-014 — Explicabilidade

A classificação deverá informar fatores positivos, lacunas e recomendações.

### RN-015 — Auditoria

Toda tentativa de candidatura deverá permanecer registrada, inclusive falhas e bloqueios.

## 4. Requisitos funcionais

### Autenticação

- **RF-001:** permitir cadastro com nome, sobrenome, e-mail e senha;
- **RF-002:** validar confirmação de senha;
- **RF-003:** impedir e-mails duplicados;
- **RF-004:** permitir login;
- **RF-005:** emitir token Sanctum no login;
- **RF-006:** permitir logout e revogar token;
- **RF-007:** permitir recuperação de senha;
- **RF-008:** proteger funcionalidades privadas.

### Perfil

- **RF-009:** permitir atualização dos dados pessoais;
- **RF-010:** permitir configuração de cargos desejados;
- **RF-011:** permitir configuração de localização e modalidade;
- **RF-012:** permitir ativar ou desativar candidaturas automáticas;
- **RF-013:** registrar consentimento e alterações nas preferências.

### Currículos

- **RF-014:** permitir upload de currículo;
- **RF-015:** validar tipo e tamanho do arquivo;
- **RF-016:** armazenar o arquivo de forma privada;
- **RF-017:** permitir múltiplas versões;
- **RF-018:** selecionar o currículo ativo;
- **RF-019:** processar o currículo assincronamente;
- **RF-020:** exibir o estado do processamento;
- **RF-021:** extrair informações estruturadas;
- **RF-022:** exibir habilidades identificadas;
- **RF-023:** exibir sugestões da IA;
- **RF-024:** preservar o resultado original da extração.

### Pesquisas

- **RF-025:** permitir iniciar uma pesquisa;
- **RF-026:** aceitar cargos e palavras-chave;
- **RF-027:** aceitar filtros de localização e modalidade;
- **RF-028:** validar plano e limites antes do processamento;
- **RF-029:** pesquisar provedores habilitados;
- **RF-030:** normalizar as vagas;
- **RF-031:** eliminar vagas duplicadas;
- **RF-032:** mostrar progresso;
- **RF-033:** permitir cancelamento quando tecnicamente possível;
- **RF-034:** manter histórico das pesquisas.

### Classificação

- **RF-035:** comparar currículo e vaga;
- **RF-036:** gerar pontuação;
- **RF-037:** armazenar a versão do algoritmo;
- **RF-038:** listar habilidades compatíveis;
- **RF-039:** listar habilidades ausentes;
- **RF-040:** explicar a pontuação;
- **RF-041:** sugerir melhorias;
- **RF-042:** permitir reprocessamento controlado.

### Candidaturas

- **RF-043:** identificar candidaturas elegíveis;
- **RF-044:** impedir duplicidade;
- **RF-045:** confirmar que o site não exige login;
- **RF-046:** rejeitar fluxos com CAPTCHA ou MFA;
- **RF-047:** preencher formulários com dados autorizados;
- **RF-048:** enviar a candidatura;
- **RF-049:** registrar os dados enviados;
- **RF-050:** registrar o resultado;
- **RF-051:** informar falhas;
- **RF-052:** permitir nova tentativa quando segura;
- **RF-053:** exibir histórico.

### Dashboard

- **RF-054:** exibir vagas encontradas;
- **RF-055:** exibir compatibilidade média;
- **RF-056:** exibir candidaturas;
- **RF-057:** exibir última pesquisa;
- **RF-058:** exibir vagas recomendadas;
- **RF-059:** exibir compatibilidade por habilidade;
- **RF-060:** exibir análise do Talora AI;
- **RF-061:** exibir notificações.

### Internacionalização

- **RF-062:** suportar `pt-BR`;
- **RF-063:** suportar `en`;
- **RF-064:** permitir alteração do idioma;
- **RF-065:** traduzir erros técnicos antes de apresentá-los;
- **RF-066:** preservar códigos de erro independentes do idioma.

### Notificações

- **RF-067:** notificar currículo processado;
- **RF-068:** notificar pesquisa concluída;
- **RF-069:** notificar candidatura realizada;
- **RF-070:** notificar falha que exija ação;
- **RF-071:** disponibilizar notificações para web e mobile.

## 5. Requisitos não funcionais

### Segurança

- **RNF-001:** utilizar HTTPS em produção;
- **RNF-002:** armazenar senhas somente por hash seguro;
- **RNF-003:** armazenar tokens de forma segura;
- **RNF-004:** aplicar autorização por usuário e recurso;
- **RNF-005:** validar uploads;
- **RNF-006:** aplicar rate limiting;
- **RNF-007:** não registrar senhas ou tokens em logs;
- **RNF-008:** proteger currículos contra acesso público.

### Desempenho

- **RNF-009:** requisições HTTP não deverão aguardar tarefas longas;
- **RNF-010:** pesquisas e candidaturas deverão utilizar filas;
- **RNF-011:** listagens deverão ser paginadas;
- **RNF-012:** dados frequentemente consultados poderão utilizar cache.

### Confiabilidade

- **RNF-013:** tarefas deverão ser idempotentes;
- **RNF-014:** falhas temporárias poderão gerar tentativas limitadas;
- **RNF-015:** mensagens definitivamente falhas deverão ser isoladas;
- **RNF-016:** estados parciais deverão permanecer recuperáveis;
- **RNF-017:** candidaturas não poderão ser duplicadas por retentativa.

### Observabilidade

- **RNF-018:** operações distribuídas deverão possuir `correlation_id`;
- **RNF-019:** erros deverão conter contexto suficiente para diagnóstico;
- **RNF-020:** o sistema deverá coletar métricas de processamento;
- **RNF-021:** ações automatizadas deverão ser auditáveis.

### Usabilidade

- **RNF-022:** web e mobile deverão ser responsivos;
- **RNF-023:** processos longos deverão apresentar estado;
- **RNF-024:** mensagens deverão ser compreensíveis;
- **RNF-025:** falhas não deverão apagar dados já preenchidos;
- **RNF-026:** a interface deverá seguir a identidade Talora.

### Privacidade

- **RNF-027:** coletar somente dados necessários;
- **RNF-028:** registrar consentimento;
- **RNF-029:** permitir exclusão dos dados;
- **RNF-030:** permitir desativação da automação;
- **RNF-031:** informar quais dados foram enviados em uma candidatura.

### Manutenibilidade

- **RNF-032:** provedores deverão ser implementados por adaptadores;
- **RNF-033:** contratos assíncronos deverão ser versionados;
- **RNF-034:** regras de elegibilidade deverão permanecer no Laravel;
- **RNF-035:** pesos da classificação deverão ser configuráveis e versionados;
- **RNF-036:** web, mobile, backend e bot deverão permanecer desacoplados.

## 6. Restrições do MVP

O MVP:

- não se candidata em sites que exijam login;
- não resolve ou contorna CAPTCHA;
- não contorna MFA;
- não pesquisa continuamente sem ação do usuário;
- não inventa dados para completar formulários;
- não repete candidaturas;
- começa com poucos provedores bem suportados;
- utiliza processamento assíncrono.

## 7. Critérios de aceite principais

### CA-001 — Cadastro

**Dado** um e-mail ainda não utilizado,  
**quando** o usuário preencher dados válidos,  
**então** a conta deverá ser criada e o usuário direcionado ao login sem receber token.

### CA-002 — Login

**Dado** um usuário cadastrado,  
**quando** informar credenciais válidas,  
**então** deverá receber um token e acessar a dashboard.

### CA-003 — Processamento do currículo

**Dado** um arquivo válido,  
**quando** o usuário enviá-lo,  
**então** o processamento deverá ocorrer assincronamente e produzir dados estruturados e uma análise.

### CA-004 — Classificação

**Dado** um currículo processado e uma vaga normalizada,  
**quando** a classificação terminar,  
**então** deverá existir uma pontuação acompanhada de explicação.

### CA-005 — Candidatura automática

**Dada** uma vaga com pontuação superior a 90%,  
**e** automação autorizada,  
**e** site sem login, CAPTCHA ou MFA,  
**e** ausência de candidatura anterior,  
**quando** a tarefa for processada,  
**então** o bot poderá enviar a candidatura e registrar o resultado.

### CA-006 — Duplicidade

**Dada** uma candidatura já registrada,  
**quando** a mesma vaga for encontrada novamente para o mesmo usuário,  
**então** nenhuma nova candidatura deverá ser enviada.

### CA-007 — Falha segura

**Dado** um formulário incompatível ou uma proteção inesperada,  
**quando** o bot não puder continuar com segurança,  
**então** deverá interromper a operação, registrar o motivo e notificar o usuário.

## 8. Prioridades

### MVP

- autenticação;
- currículos;
- processamento;
- primeiro provedor;
- classificação explicável;
- candidatura em site sem login;
- dashboard;
- histórico;
- notificações essenciais.

### Pós-MVP

- novos provedores;
- analytics avançado;
- múltiplos currículos por objetivo;
- otimização assistida do currículo;
- planos e cobrança;
- relatórios;
- evolução do mecanismo de classificação.

