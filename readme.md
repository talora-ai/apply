# Talora Apply

O **Talora Apply** é um agente inteligente de carreira que analisa currículos, pesquisa vagas publicadas na internet, calcula a compatibilidade entre candidato e oportunidade e pode realizar candidaturas automaticamente quando as regras do produto forem atendidas.

## Objetivo

Reduzir o trabalho repetitivo da busca por emprego e, ao mesmo tempo, ajudar o usuário a entender:

- quais vagas combinam com seu perfil;
- por que uma vaga recebeu determinada pontuação;
- quais requisitos foram atendidos;
- o que está ausente ou pouco demonstrado no currículo;
- como melhorar a apresentação de suas experiências e habilidades;
- onde e quando uma candidatura foi realizada.

## Regra principal da automação

O Talora Apply somente realizará uma candidatura automática quando:

- a compatibilidade for superior a 90%;
- o usuário tiver autorizado a automação;
- o site não exigir login;
- não houver CAPTCHA, MFA ou outra verificação humana;
- a vaga ainda estiver disponível;
- todos os dados obrigatórios estiverem disponíveis;
- o usuário ainda não tiver se candidatado à mesma vaga.

O sistema não tentará contornar mecanismos de proteção dos sites.

## Faixas de compatibilidade

| Pontuação | Resultado |
| --- | --- |
| Abaixo de 70% | Baixa compatibilidade; não se candidata automaticamente |
| De 70% até 90% | Vaga recomendada para análise do usuário |
| Acima de 90% | Elegível para candidatura automática |

A pontuação final não é suficiente por si só. Toda análise deve apresentar os fatores positivos, os requisitos ausentes e as sugestões da IA.

## Stack

| Camada | Tecnologia | Responsabilidade |
| --- | --- | --- |
| Backend | Laravel 13 | API, autenticação, regras, persistência, filas e orquestração |
| Web | Next.js | Aplicação web e experiência do usuário |
| Mobile | Expo/React Native | Aplicativo Android/iOS |
| Bot | Python | Currículos, busca de vagas, coleta e candidaturas |
| IA | Serviço integrado ao Laravel | Comparação, explicação e sugestões |
| Banco | A definir na infraestrutura | Dados transacionais e resultados |
| Filas | A definir na infraestrutura | Processamento assíncrono |

## Estrutura do repositório

```text
apply/
├── backend/       # API Laravel
├── bot/           # Processamento e automação em Python
├── frontend/      # Aplicação web Next.js
├── mobile/        # Aplicativo Expo/React Native
├── architecture.md
├── read.md
└── requirements.md
```

Cada aplicação é independente e possui suas próprias dependências e configurações.

## Estado inicial

### Backend

- cadastro;
- login com Laravel Sanctum;
- emissão de token;
- rotas protegidas;
- estrutura inicial da API.

### Frontend

- login;
- cadastro;
- dashboard;
- internacionalização;
- comunicação com a API;
- token em cookie `HttpOnly`.

### Mobile

- login;
- cadastro;
- dashboard;
- internacionalização;
- comunicação com a API;
- armazenamento do token com `expo-secure-store`.

## Fluxo resumido

1. O usuário cria a conta e realiza o login.
2. Envia um currículo.
3. O Laravel registra e agenda seu processamento.
4. O bot extrai os dados do documento.
5. A IA interpreta o currículo e sugere melhorias.
6. O usuário inicia uma pesquisa.
7. O bot coleta e normaliza as vagas.
8. Laravel e IA calculam e explicam a compatibilidade.
9. Vagas elegíveis geram tarefas de candidatura.
10. O bot envia a candidatura e devolve o resultado.
11. O usuário acompanha tudo pelo dashboard.

## Documentação

- [`architecture.md`](architecture.md): arquitetura, componentes, integrações e fluxos técnicos.
- [`requirements.md`](requirements.md): regras de negócio e requisitos funcionais e não funcionais.
- [`Talora-Apply-Documentacao-Tecnica.md`](Talora-Apply-Documentacao-Tecnica.md): visão técnica ampliada do produto.

## Princípios do projeto

- processamento assíncrono;
- responsabilidades bem separadas;
- Laravel como fonte oficial das regras de negócio;
- bot organizado por adaptadores de provedores;
- operações idempotentes;
- análises de IA explicáveis;
- nenhuma experiência ou habilidade inventada;
- segurança e privacidade desde o início;
- evolução incremental, com refatoração orientada pelo amadurecimento do produto.

