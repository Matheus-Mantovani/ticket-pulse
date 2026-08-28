# 🎟️ TicketPulse — Backend API (Deno 2 + MongoDB Atlas)

[![Deno](https://img.shields.io/badge/Deno-2.x-black?style=flat-square&logo=deno)](https://deno.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey?style=flat-square&logo=express)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-Cluster-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/atlas)
[![OpenAPI 3.0](https://img.shields.io/badge/Swagger-OpenAPI_3.0-brightgreen?style=flat-square&logo=swagger)](http://localhost:3000/api-docs)

O **TicketPulse** é uma API RESTful para gerenciamento de eventos e venda de ingressos com **transações atômicas multi-documento no MongoDB Atlas**, desenvolvida em **Deno 2** utilizando **Express**, **TypeScript** e **Mongoose**.

---

## 📌 Sumário

1. [Visão Geral & Recursos](#-visão-geral--recursos)
2. [Arquitetura & Padrões Corporativos AGX](#-arquitetura--padrões-corporativos-agx)
3. [Como Executar](#-como-executar)
4. [Comprovação dos 5 Pacotes Obrigatórios da AGX](#-comprovação-dos-5-pacotes-obrigatórios-da-agx)
5. [Variáveis de Ambiente (.env)](#-variáveis-de-ambiente-env)
6. [Tabela Completa de Endpoints da API](#-tabela-completa-de-endpoints-da-api)
7. [Documentação Publicada (Swagger UI & Postman Collection)](#-documentação-publicada-swagger-ui--postman-collection)

---

## 🎟️ Visão Geral & Recursos

- 🔐 **Autenticação & Autorização JWT**: Cadastro de usuários, login, renovação via Refresh Token e controle de acesso baseado em perfis (RBAC - `ADMIN` vs `USER`).
- 📅 **CRUD Completo de Eventos**: Criação, edição, busca paginada com filtros por categoria/título e exclusão de eventos (Restrito a `ADMIN`).
- ⚡ **Operação Atômica ACID Multi-Documento**: Fluxo de compra de ingressos com decremento de estoque e emissão de bilhete único executado dentro de uma sessão `session.startTransaction()` do MongoDB Atlas.
- 📦 **Padrão de Resposta JSON & Tratamento de Erros**: Respostas HTTP padronizadas (`responser`) e middleware centralizado de exceções (`throwlhos`).
- 📄 **Documentação Interativa Publicada**: Swagger UI exposto na rota `/api-docs` e Coleção Postman exportada com script automático de captura de JWT.

---

## 🏗️ Arquitetura & Padrões Corporativos AGX

A aplicação segue rigorosamente os padrões de engenharia da **AGX Software**:

1. **Mongoose Models com `Schema.loadClass(Class)`**:
   - Definição de interfaces no topo do arquivo.
   - Declaração do Mongoose Schema no meio com `default: null` em propriedades opcionais.
   - Carregamento da classe POO no final via `schema.loadClass(Class)`.
   - Arquivos: [`src/models/User.ts`](src/models/User.ts), [`src/models/Event.ts`](src/models/Event.ts), [`src/models/Ticket.ts`](src/models/Ticket.ts).

2. **Repositório Base Genérico `BaseRepository<T>` sem `await`**:
   - Abstração abstrata generificada em [`src/repositories/BaseRepository.ts`](src/repositories/BaseRepository.ts).
   - Não realiza `await` interno, retornando instâncias de `Query` Mongoose diretamente para composição de `.exec()`, `.lean()`, `.select()`.
   - Repositórios concretos: [`UserRepository.ts`](src/repositories/UserRepository.ts), [`EventRepository.ts`](src/repositories/EventRepository.ts), [`TicketRepository.ts`](src/repositories/TicketRepository.ts).

3. **Services com Namespace Pattern e Injeção de Dependência**:
   - Definição via `export namespace ServiceName` com sub-namespaces para contratos de entrada.
   - Envelopamento estrito de parâmetros em `{ input: { ... } }`.
   - Injeção de repositórios via construtor com valores default (`new Repository()`).
   - Arquivos: [`src/services/authService.ts`](src/services/authService.ts), [`src/services/eventService.ts`](src/services/eventService.ts), [`src/services/ticketService.ts`](src/services/ticketService.ts).

4. **Controllers com Formatação de Blocos Estrita & Caminhos Absolutos**:
   - Eliminação de *one-liners*: uso de blocos com chaves `{}` obrigatórios em todos os `if`, `throw` e `return`.
   - Registro de rotas com caminhos absolutos completos ([`authRoutes.ts`](src/routes/authRoutes.ts), [`eventRoutes.ts`](src/routes/eventRoutes.ts), [`ticketRoutes.ts`](src/routes/ticketRoutes.ts)).
   - Envio de metadados de depuração / contexto no 2º argumento de `responser` e `throwlhos`.

---

## 🚀 Como Executar

- **Clone este repositório**:
    ```bash
    git clone https://github.com/Matheus-Mantovani/ticket-pulse.git
    cd ticket-pulse
    ```

- **Instale o Deno (se necessário)**:
    ```bash
    curl -fsSL https://deno.land/install.sh | sh
    # Adicione Deno ao PATH (se instalado via script)
    export PATH="$HOME/.deno/bin:$PATH"
    ```

- **Configure as Variáveis de Ambiente (.env)**:
    Crie o arquivo `.env` com base no `.env.example`:
    ```bash
    cp .env.example .env
    ```
    Preencha com a sua URI do MongoDB Atlas (`MONGO_URI` e `MONGO_URI_TEST`).

- **Inicie o Servidor**:
    ```bash
    # Para iniciar no banco de dados principal (ticket_pulse)
    deno task dev
    
    # Para iniciar no banco de dados de testes (ticket_pulse_tests - ideal para Postman / Swagger)
    deno task dev:test
    
    # Para iniciar em modo de produção
    deno task start
    ```

- **Execute os Testes Automatizados**:
    ```bash
    # Executar toda a suíte de testes (Unitários + Integração E2E - 33 cenários)
    deno task test
    
    # Executar apenas testes unitários dos controllers (Mocks sem await)
    deno test tests/unit/
    ```

---

## 📦 Comprovação dos 5 Pacotes Obrigatórios da AGX

A aplicação integra rigorosamente os 5 pacotes obrigatórios da especificação AGX:

| Pacote | Função no Projeto | Arquivo de Implementação / Exemplo de Código |
| :--- | :--- | :--- |
| **`npm:morgan`** | Logging detalhado de todas as requisições HTTP recebidas no terminal. | [`src/app.ts`](src/app.ts)<br>`app.use(morgan("dev"));` |
| **`npm:responser`** | Padronização do contrato de respostas JSON (`status`, `code`, `success`, `message`, `data`). | [`src/utils/response.ts`](src/utils/response.ts)<br>Middlewares globais e respostas de controllers. |
| **`npm:request-check`** | Validação estrita de presença e obrigatoriedade de campos no payload HTTP. | [`src/utils/validation.ts`](src/utils/validation.ts)<br>`checkRequestFields(req.body, ["email", "password"])` |
| **`npm:throwlhos`** | Lançamento e captura centralizada de exceções HTTP (`badRequest`, `unauthorized`, `notFound`). | [`src/utils/validation.ts`](src/utils/validation.ts) & [`src/middlewares/errorHandler.ts`](src/middlewares/errorHandler.ts)<br>`throw throwlhos.err_badRequest(...)` |
| **`jsr:@zarco/isness`** | Checagem e asserção de tipos (validação de e-mail, datas futuras, números positivos). | [`src/utils/validation.ts`](src/utils/validation.ts)<br>`isness(email).isEmail()`, `isness(price).isPositiveNumber()` |

---

## 🔑 Variáveis de Ambiente (.env)

| Variável | Descrição | Exemplo de Valor |
| :--- | :--- | :--- |
| `PORT` | Porta de execução do servidor HTTP | `3000` |
| `MONGO_URI` | URI do cluster MongoDB Atlas para a base principal | `mongodb+srv://user:pass@cluster.net/ticket_pulse` |
| `MONGO_URI_TEST` | URI do cluster MongoDB Atlas para a base isolada de testes | `mongodb+srv://user:pass@cluster.net/ticket_pulse_tests` |
| `JWT_SECRET` | Chave secreta para assinatura dos Access Tokens JWT | `super_secret_jwt_key_ticket_pulse_123` |
| `JWT_REFRESH_SECRET` | Chave secreta para assinatura dos Refresh Tokens JWT | `super_secret_refresh_key_ticket_pulse_456` |

---

## 🗺️ Tabela Completa de Endpoints da API

### 🏥 Health
| Método | Endpoint | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Público | Retorna o status de saúde da aplicação e timestamp. |
| `GET` | `/api-docs` | Público | Documentação pública e interativa via Swagger UI. |

### 🔐 Autenticação (`/api/auth`)
| Método | Endpoint | Acesso | Descrição | Body Requerido | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Público | Cadastra um novo usuário (`USER` ou `ADMIN`). | `{ name, email, password, role? }` | 201 / 400 |
| `POST` | `/api/auth/login` | Público | Autentica usuário e retorna JWT Access Token & Refresh Token. | `{ email, password }` | 200 / 401 |
| `POST` | `/api/auth/refresh` | Público | Emite novo Access Token a partir de um Refresh Token. | `{ refreshToken }` | 200 / 401 |
| `GET` | `/api/auth/me` | Bearer JWT | Retorna o perfil do usuário logado. | *Nenhum* | 200 / 401 |

### 📅 Eventos (`/api/events`)
| Método | Endpoint | Acesso | Descrição | Query / Body | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | Público | Lista eventos ativos com paginação e busca. | `?page=1&limit=10&search=Rock` | 200 |
| `GET` | `/api/events/:id` | Público | Retorna detalhes de um evento por ID. | *Nenhum* | 200 / 404 |
| `POST` | `/api/events` | Admin (`ADMIN`) | Cria um novo evento. | `{ title, date, location, price, totalTickets }` | 201 / 400 / 403 |
| `PUT` | `/api/events/:id` | Admin (`ADMIN`) | Atualiza dados de um evento. | `{ title?, price?, location?, ... }` | 200 / 403 / 404 |
| `DELETE` | `/api/events/:id` | Admin (`ADMIN`) | Remove um evento. | *Nenhum* | 200 / 403 / 404 |

### 🎟️ Ingressos & Transação ACID (`/api/tickets`)
| Método | Endpoint | Acesso | Descrição | Body Requerido | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/tickets/purchase` | Bearer JWT | Executa a **compra atômica** de um ingresso com decremento de estoque. | `{ eventId }` | 201 / 400 / 404 |
| `GET` | `/api/tickets/my-tickets` | Bearer JWT | Retorna os ingressos comprados pelo usuário autenticado. | *Nenhum* | 200 / 401 |

---

## 📄 Documentação Publicada (Swagger UI & Postman Collection)

### 🌐 Swagger UI (Navegador)
Inicie a aplicação (`deno task dev` ou `deno task dev:test`) e acesse no navegador:
👉 **`http://localhost:3000/api-docs`**

Toda a especificação OpenAPI 3.0 é servida interativamente com botão de teste **Try it out** e suporte para autenticação Bearer no topo da página.

### 📬 Coleção Postman com Auto-JWT
Os arquivos para importação no Postman estão localizados na pasta [`postman/`](postman):
1. **Coleção**: `postman/TicketPulse.postman_collection.json`
2. **Ambiente**: `postman/TicketPulse.postman_environment.json`

> 🪄 **Destaque de Automação**: Na requisição `POST /api/auth/login`, o script na aba *Tests* do Postman captura automaticamente os campos `res.data.token` e `res.data.refreshToken` e os salva no ambiente Postman (`jwt_token` e `refresh_token`), permitindo testar todas as rotas protegidas sem copiar tokens manualmente!

---

## 👨‍💻 Autor

Desenvolvido por **Matheus Mantovani** para a **AGX Software**.
