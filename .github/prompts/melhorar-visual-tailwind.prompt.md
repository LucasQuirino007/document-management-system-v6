---
description: Melhora o visual do frontend do DMS aplicando Tailwind CSS 3.
name: melhorar-visual-tailwind
agent: ui-tailwind
---

# Melhorar visual do frontend com Tailwind CSS 3

Use o agente `ui-tailwind` para modernizar o visual do frontend do Document Management System com Tailwind CSS 3, sem quebrar funcionalidades existentes.

Contexto atual:

- Frontend em React + Vite (`frontend/src`), com estilos inline simples em `App.jsx` e componentes sem estilização (`UploadComponent.jsx`, `DocumentList.jsx`, `DownloadButton.jsx`).
- Não há Tailwind CSS nem outra biblioteca de estilos configurada ainda.

Requisitos:

1. Configurar Tailwind CSS 3 no projeto `frontend` (dependências, `tailwind.config.js`, `postcss.config.js` e CSS de entrada).
2. Aplicar um layout limpo e responsivo em `App.jsx`, `UploadComponent.jsx`, `DocumentList.jsx` e `DownloadButton.jsx` usando classes utilitárias do Tailwind.
3. Manter toda a lógica de estado, chamadas via `documentsApi` e mensagens de erro (`role="alert"`) intactas.
4. Melhorar a experiência visual de estados de carregamento (upload/download) e da tabela de documentos.
5. Validar o build do frontend ao final (`npm run build` em `frontend`).
