# Talora Apply

## Conceito e posicionamento do produto

**Talora Apply é o produto do ecossistema Talora dedicado a currículo, descoberta de oportunidades, compatibilidade profissional e candidaturas assistidas.**

Ele transforma uma rotina fragmentada e repetitiva em uma jornada centralizada, explicável e controlada pelo usuário.

## Relação com Talora

Talora é a marca principal e representa um ecossistema abrangente de soluções inteligentes. **Apply** é o descritor funcional de um de seus produtos: a aplicação dessa capacidade ao processo de encontrar oportunidades e realizar candidaturas.

```text
Talora       → marca principal e agente inteligente
Talora Apply → produto de currículo, vagas e candidaturas
```

O nome completo deve ser preservado em documentação, produto, interfaces, e-mails, repositórios e comunicação institucional.

## O problema

Buscar uma oportunidade normalmente exige repetir as mesmas atividades em vários lugares: revisar o currículo, localizar vagas, interpretar requisitos, comparar o próprio perfil, preencher formulários e acompanhar resultados.

As ferramentas tradicionais geralmente resolvem apenas uma parte desse ciclo. Algumas listam vagas; outras analisam currículos; outras armazenam candidaturas. O usuário continua responsável por conectar as etapas e compreender por que determinada oportunidade é ou não adequada.

## A proposta

Talora Apply reúne o ciclo em uma experiência única:

1. recebe e processa o currículo;
2. estrutura experiências e habilidades sem inventar informações;
3. pesquisa vagas quando o usuário solicitar;
4. normaliza e organiza oportunidades públicas;
5. calcula a compatibilidade entre candidato e vaga;
6. explica pontos fortes, lacunas e motivos da pontuação;
7. sugere melhorias coerentes com o histórico real;
8. realiza candidaturas elegíveis quando houver autorização;
9. registra resultados e mantém o usuário informado.

## Proposta de valor

> **Menos repetição. Mais clareza. Ações profissionais executadas com controle.**

Talora Apply não promete uma contratação e não transforma compatibilidade em certeza. Seu valor está em reduzir esforço operacional, aumentar a qualidade da análise e permitir que o usuário tome decisões com mais evidências.

## Diferencial

O diferencial do produto é a combinação de **automação controlada, transparência e explicabilidade**.

### Automação controlada

Ações automáticas dependem de regras determinísticas e autorização do usuário. A IA não decide sozinha quando uma candidatura deve ser enviada.

### Transparência

Pesquisas, análises e tentativas de candidatura mantêm estados e histórico. O usuário deve saber o que aconteceu, quando aconteceu e qual foi o resultado.

### Explicabilidade

Uma pontuação isolada não basta. Toda compatibilidade precisa apresentar fatores positivos, requisitos ausentes e sugestões de melhoria.

## Regras de candidatura

No MVP, a candidatura automática somente é elegível quando:

- a compatibilidade é superior a 90%;
- o usuário autorizou a automação;
- a vaga continua disponível;
- o site não exige login;
- não existem CAPTCHA, MFA ou verificações humanas;
- todos os dados obrigatórios estão disponíveis;
- não existe candidatura anterior do mesmo usuário para a mesma vaga.

O produto não tenta contornar mecanismos de proteção de terceiros.

## Faixas de compatibilidade

| Pontuação | Interpretação | Ação |
| --- | --- | --- |
| Abaixo de 70% | Baixa compatibilidade | Informar lacunas; não automatizar |
| De 70% a 90% | Oportunidade recomendada | Apresentar para análise do usuário |
| Acima de 90% | Alta compatibilidade | Avaliar regras para candidatura automática |

## Papel da inteligência artificial

A IA atua em conjunto com o Laravel para interpretar os dados estruturados pelo bot. Ela pode explicar uma classificação, indicar pontos fortes, identificar informações pouco demonstradas e sugerir melhorias de apresentação.

A IA não pode:

- inventar experiências, habilidades, formação ou resultados;
- alterar fatos do currículo para aumentar compatibilidade;
- autorizar sozinha uma candidatura;
- substituir as validações determinísticas e as regras persistidas pelo Laravel.

## Papel dos componentes

| Componente | Responsabilidade |
| --- | --- |
| Laravel | Regras, autorização, persistência, auditoria e orquestração |
| Bot | Processamento, coleta, normalização e execução técnica |
| IA | Interpretação, explicação e sugestões estruturadas |
| Next.js | Experiência Web |
| Expo/React Native | Experiência Mobile |

Laravel permanece como fonte oficial das decisões de negócio. O bot executa tarefas autorizadas e devolve resultados; a IA enriquece a compreensão; Web e Mobile apresentam a experiência.

## Experiência do produto

Talora Apply deve parecer uma agente em atividade, não apenas um painel de indicadores. O Talora AI ocupa posição de destaque e comunica o que está analisando, quais conclusões encontrou e qual é o próximo passo possível.

A interface é dark-first, moderna e minimalista. O roxo identifica a inteligência Talora; o verde destaca ação, progresso e compatibilidade.

## Mensagens centrais

### Assinatura

> **Talora Apply — seu agente inteligente de carreira.**

### Promessa de experiência

> **Seu próximo passo começa aqui.**

### Explicação curta

> Analise seu currículo, encontre oportunidades compatíveis e acompanhe suas candidaturas em um só lugar.

## Limites da promessa

Talora Apply não garante contratação, não substitui decisões humanas de recrutamento e não manipula informações profissionais. O produto auxilia o usuário com análise, organização e automação permitida, preservando consentimento, segurança e rastreabilidade.

## Síntese

Talora Apply materializa o conceito Talora em uma jornada concreta. O produto conecta currículo, busca, análise e candidatura sem esconder critérios e sem retirar o controle do usuário.

**Enquanto plataformas tradicionais entregam uma lista de vagas, Talora Apply trabalha para transformar o perfil do usuário em decisões compreensíveis e ações rastreáveis.**
