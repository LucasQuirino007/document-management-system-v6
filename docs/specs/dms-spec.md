# Especificação - Document Management System

## 1. Objetivo

Permitir que usuários enviem, consultem e baixem seus próprios documentos, com arquivos armazenados localmente e metadados mantidos em memória.

## 2. Escopo

### Dentro do escopo

- Upload de um documento por vez.
- Listagem dos documentos pertencentes ao usuário solicitante.
- Download de um documento do usuário solicitante pelo identificador.
- Identificação simples do proprietário pelo cabeçalho HTTP `X-User-Id`.
- Armazenamento de arquivos no filesystem local da aplicação.
- Metadados dos documentos mantidos em memória enquanto o processo estiver em execução.

### Fora do escopo

- Autenticação, autorização baseada em token e gestão de contas.
- Banco de dados e persistência de metadados após reinicialização.
- Armazenamento externo ou em nuvem.
- Versionamento, exclusão, edição, compartilhamento ou busca de documentos.
- Upload múltiplo, processamento assíncrono, antivírus e conversão de arquivos.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O sistema deve permitir que o usuário envie um arquivo como documento. |
| RF-02 | O sistema deve permitir que o usuário liste somente os metadados de seus próprios documentos. |
| RF-03 | O sistema deve permitir que o usuário baixe um documento próprio pelo seu identificador. |
| RF-04 | O sistema deve exigir o cabeçalho `X-User-Id` em todas as operações de documentos. |

### RF-01 - Envio de documento

- O cliente deve enviar uma requisição `multipart/form-data` com um único arquivo no campo `file` e o cabeçalho `X-User-Id` preenchido.
- O sistema deve gravar o conteúdo em `backend/storage` usando `multer` com `diskStorage`.
- O nome usado no filesystem deve ser gerado pelo servidor para evitar colisões e não deve ser exposto na API.
- Após a gravação bem-sucedida, o sistema deve criar e manter em memória os metadados do documento, associando-o ao valor de `X-User-Id`.
- O sistema deve responder com os metadados públicos do documento criado.

**Critérios de aceite**

- Um arquivo válido enviado por usuário identificado retorna `201 Created` e seus metadados públicos.
- A ausência de arquivo ou de `X-User-Id` retorna `400 Bad Request`.
- Uma falha de gravação não cria metadados do documento.

### RF-02 - Listagem de documentos

- O cliente deve informar `X-User-Id`.
- O sistema deve retornar todos os metadados públicos associados a esse usuário, ordenados do upload mais recente para o mais antigo.
- Quando não houver documentos, o sistema deve retornar uma lista vazia.
- O sistema não deve incluir documentos de outros proprietários, nem expor dados internos de armazenamento.

**Critérios de aceite**

- Um usuário visualiza somente documentos cujo `owner` corresponde ao seu `X-User-Id`.
- A listagem sem documentos retorna `200 OK` com `documents: []`.
- A ausência de `X-User-Id` retorna `400 Bad Request`.

### RF-03 - Download de documento

- O cliente deve informar o identificador do documento na rota e o cabeçalho `X-User-Id`.
- O sistema deve localizar o documento pelo identificador e confirmar que pertence ao usuário solicitante antes de ler o arquivo local.
- O sistema deve transmitir o conteúdo binário, preservando o nome original no download.
- Um identificador inexistente ou pertencente a outro usuário deve retornar `404 Not Found`, sem revelar a existência do documento.

**Critérios de aceite**

- O proprietário recebe `200 OK` com o conteúdo original do arquivo e cabeçalho de anexo.
- Outro usuário não consegue baixar o mesmo documento e recebe `404 Not Found`.
- A ausência de `X-User-Id` retorna `400 Bad Request`.

### RF-04 - Identificação simples do proprietário

- `X-User-Id` é um identificador textual obrigatório nesta fase e substitui autenticação formal.
- O valor deve ser removido de espaços nas extremidades e conter ao menos um caractere após a normalização.
- O mesmo valor identifica o proprietário no upload e delimita a listagem e o download.

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | O backend deve usar Node.js, Express e CommonJS. |
| RNF-02 | Os arquivos devem ser gravados exclusivamente no filesystem local, em `backend/storage`, por `multer` configurado com `diskStorage`. |
| RNF-03 | Os metadados devem ficar exclusivamente em memória nesta fase; reiniciar o processo remove o catálogo disponível. |
| RNF-04 | A configuração deve usar variáveis de ambiente, em conformidade com 12-Factor App. |
| RNF-05 | A implementação deve respeitar o fluxo `routes -> controllers -> services -> repositories`. |
| RNF-06 | As respostas de erro da API devem usar uma estrutura JSON uniforme. |
| RNF-07 | Caminhos locais, nomes internos de arquivos e detalhes de exceções não devem ser expostos ao cliente. |

### Configuração

| Variável | Obrigatória | Padrão | Finalidade |
| --- | --- | --- | --- |
| `PORT` | Não | `3000` | Porta do servidor HTTP. |
| `STORAGE_PATH` | Não | `backend/storage` | Diretório local onde os arquivos enviados são gravados. |
| `MAX_FILE_SIZE_BYTES` | Não | `10485760` | Tamanho máximo permitido por arquivo, em bytes (10 MiB). |

### Validação e segurança operacional

- A requisição de upload deve conter exatamente um arquivo no campo `file`.
- O limite de tamanho deve ser aplicado pelo Multer usando `MAX_FILE_SIZE_BYTES`.
- Nesta fase não há restrição de tipo MIME; o tipo informado pelo cliente é tratado apenas como metadado de resposta para download quando disponível.
- O nome original deve ser mantido apenas como metadado e nunca usado diretamente para compor o caminho de armazenamento.
- O diretório de armazenamento deve existir ou ser criado antes de aceitar uploads.

## 5. Modelo de dados

### Documento interno

Os registros abaixo existem somente em memória e são a fonte de verdade do catálogo durante a execução atual do processo.

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `id` | string | Sim | Identificador único gerado pelo servidor. |
| `originalName` | string | Sim | Nome do arquivo informado pelo cliente. |
| `size` | number | Sim | Tamanho do arquivo em bytes. |
| `mimeType` | string | Não | Tipo MIME informado pelo upload, quando disponível. |
| `uploadedAt` | string | Sim | Data/hora do upload em ISO 8601 UTC. |
| `owner` | string | Sim | Valor normalizado de `X-User-Id`. |
| `storedFilename` | string | Sim | Nome gerado internamente para o arquivo no diretório local. |

### Metadados públicos

As respostas JSON nunca incluem `storedFilename`. O formato público é:

```json
{
  "id": "c5f33e33-8cf8-4e4f-9c2b-2e6f1aa9dc5f",
  "originalName": "contrato.pdf",
  "size": 284712,
  "mimeType": "application/pdf",
  "uploadedAt": "2026-09-01T14:30:00.000Z",
  "owner": "usuario-123"
}
```

### Regras de ciclo de vida

- O `id` deve ser gerado pelo servidor e ser único entre os registros em memória.
- O registro só é criado após o arquivo ser gravado com sucesso.
- O documento fica disponível até o processo ser reiniciado.
- Como não há operação de exclusão, arquivos e metadados não são removidos pelo sistema nesta fase.

## 6. Contratos de API

O frontend futuro deve chamar as rotas pelo prefixo `/api`; o proxy do Vite encaminhará a requisição ao backend, onde as rotas abaixo são expostas sem esse prefixo.

### Convenções comuns

#### Cabeçalho de proprietário

| Cabeçalho | Obrigatório | Exemplo |
| --- | --- | --- |
| `X-User-Id` | Sim | `usuario-123` |

#### Formato de erro

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "O cabeçalho X-User-Id é obrigatório.",
    "details": []
  }
}
```

`details` é opcional e deve ser usado apenas para apontar problemas de validação específicos. Mensagens devem ser apresentáveis ao usuário e não devem expor detalhes internos.

### POST /upload

Envia e registra um documento.

**Requisição**

| Item | Valor |
| --- | --- |
| Método | `POST` |
| Caminho do backend | `/upload` |
| Caminho pelo frontend | `/api/upload` |
| Content-Type | `multipart/form-data` gerado pelo cliente HTTP |
| Cabeçalho obrigatório | `X-User-Id` |
| Campo obrigatório | `file` (arquivo único) |

Não deve ser definido manualmente o cabeçalho `Content-Type` ao usar `FormData`, para que o cliente inclua o limite multipart correto.

**Resposta de sucesso - 201 Created**

```json
{
  "document": {
    "id": "c5f33e33-8cf8-4e4f-9c2b-2e6f1aa9dc5f",
    "originalName": "contrato.pdf",
    "size": 284712,
    "mimeType": "application/pdf",
    "uploadedAt": "2026-09-01T14:30:00.000Z",
    "owner": "usuario-123"
  }
}
```

**Erros**

| Status | Código | Condição |
| --- | --- | --- |
| `400` | `VALIDATION_ERROR` | `X-User-Id` ausente ou vazio, campo `file` ausente ou quantidade de arquivos inválida. |
| `413` | `FILE_TOO_LARGE` | Arquivo excede `MAX_FILE_SIZE_BYTES`. |
| `500` | `UPLOAD_FAILED` | Falha inesperada ao armazenar o arquivo ou registrar metadados. |

### GET /documents

Lista os metadados públicos dos documentos do usuário solicitante.

**Requisição**

| Item | Valor |
| --- | --- |
| Método | `GET` |
| Caminho do backend | `/documents` |
| Caminho pelo frontend | `/api/documents` |
| Cabeçalho obrigatório | `X-User-Id` |
| Parâmetros de consulta | Não definidos nesta fase. |

**Resposta de sucesso - 200 OK**

```json
{
  "documents": [
    {
      "id": "c5f33e33-8cf8-4e4f-9c2b-2e6f1aa9dc5f",
      "originalName": "contrato.pdf",
      "size": 284712,
      "mimeType": "application/pdf",
      "uploadedAt": "2026-09-01T14:30:00.000Z",
      "owner": "usuario-123"
    }
  ]
}
```

**Erros**

| Status | Código | Condição |
| --- | --- | --- |
| `400` | `VALIDATION_ERROR` | `X-User-Id` ausente ou vazio. |
| `500` | `LIST_FAILED` | Falha inesperada ao consultar metadados. |

### GET /documents/:id/download

Baixa o conteúdo de um documento pertencente ao usuário solicitante.

**Requisição**

| Item | Valor |
| --- | --- |
| Método | `GET` |
| Caminho do backend | `/documents/:id/download` |
| Caminho pelo frontend | `/api/documents/:id/download` |
| Cabeçalho obrigatório | `X-User-Id` |
| Parâmetro de rota | `id`: identificador do documento. |

**Resposta de sucesso - 200 OK**

- Corpo: fluxo binário do arquivo.
- `Content-Type`: tipo MIME armazenado; `application/octet-stream` quando indisponível.
- `Content-Disposition`: `attachment` com o nome original do arquivo.

**Erros**

| Status | Código | Condição |
| --- | --- | --- |
| `400` | `VALIDATION_ERROR` | `X-User-Id` ausente ou vazio, ou `id` inválido. |
| `404` | `DOCUMENT_NOT_FOUND` | Documento inexistente, de outro usuário ou arquivo local não encontrado. |
| `500` | `DOWNLOAD_FAILED` | Falha inesperada ao abrir ou transmitir o arquivo. |

## 7. Decisões arquiteturais

### Backend

O backend deve aplicar Clean Architecture simples em `backend/src`, com a direção de dependência abaixo:

```text
routes -> controllers -> services -> repositories
```

| Camada | Responsabilidade |
| --- | --- |
| `routes/` | Define endpoints, conecta o middleware Multer e delega aos controllers. |
| `controllers/` | Lê `req` e `res`, valida formato HTTP básico, transforma falhas conhecidas em respostas e transmite downloads. |
| `services/` | Implementa regras de negócio: normalização do proprietário, criação de metadados, isolamento por usuário e ordenação. |
| `repositories/` | Grava e lê arquivos no diretório local e mantém o catálogo de metadados em memória. |

- Controllers não devem conter regra de negócio ou manipular o catálogo diretamente.
- Services e repositories não devem depender de `req`, `res` ou detalhes do Express.
- O Multer é uma preocupação de borda: deve ser configurado na composição das rotas com `diskStorage` e limites de arquivo.
- O repositório deve receber caminhos configurados e não acessar variáveis de ambiente diretamente.
- Falhas de filesystem devem ser tratadas na borda HTTP sem vazar caminhos ou stacks ao cliente.

### Frontend

- O frontend futuro deve ser React com Vite, organizado em `components/`, `pages/` e `services/`.
- A comunicação HTTP deve usar `fetch` por um serviço dedicado e caminhos iniciados em `/api`.
- O serviço deve enviar `X-User-Id` em upload, listagem e download.
- A interface deve exibir mensagens de erro retornadas pela API e não deve acessar diretamente `backend/storage`.

## 8. Plano de execução

1. Definir a configuração de ambiente, garantir a criação do diretório de armazenamento e centralizar constantes de upload.
2. Implementar o repositório de arquivos locais usando `multer` com `diskStorage` e o repositório de metadados em memória.
3. Implementar os serviços de upload, listagem e obtenção para download, incluindo normalização de proprietário, geração de identificador e isolamento por usuário.
4. Implementar controllers para validar `X-User-Id`, adaptar entradas HTTP, devolver o formato de erro padronizado e transmitir o arquivo no download.
5. Implementar rotas e configurar o middleware Multer somente para `POST /upload`.
6. Cobrir o backend com testes de upload, listagem isolada por usuário, download autorizado, `404` para outro usuário e erros de validação e tamanho.
7. Implementar o serviço HTTP do frontend com `fetch` e as telas/componentes de envio, listagem e download usando o prefixo `/api`.
8. Validar manualmente o fluxo completo com dois usuários distintos, arquivo dentro do limite, arquivo acima do limite e reinicialização do backend para confirmar a natureza volátil dos metadados.