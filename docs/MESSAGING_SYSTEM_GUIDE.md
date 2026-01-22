# Sistema de Mensagens TRATA Imobiliária

## Visão Geral

Este documento descreve o sistema profissional de mensagens desenvolvido para a TRATA Imobiliária, inspirado em soluções como Intercom e Zendesk, com capacidade de bridge email-chat.

## Componentes Criados

### 1. UserMessaging.jsx
**Localização:** `src/components/UserMessaging.jsx`

Interface de mensagens para clientes/utilizadores com:
- ✅ Lista de conversas com pesquisa
- ✅ Imagens dos imóveis nas conversas
- ✅ Contador de mensagens não lidas
- ✅ Chat em tempo real (WhatsApp style)
- ✅ Avatares e timestamps
- ✅ Indicadores de leitura (double check)
- ✅ Cartão do imóvel no header do chat
- ✅ Modal para nova conversa
- ✅ Sistema de presença (online/offline)
- ✅ Layout responsivo (mobile-first)

### 2. AdminConversations.jsx
**Localização:** `src/components/AdminConversations.jsx`

Painel de gestão de conversas para admin/vendedor com:
- ✅ Dashboard com estatísticas
- ✅ Lista de todas as conversas de clientes
- ✅ Indicadores online/offline em tempo real
- ✅ Filtros (todas, por ler, urgentes, resolvidas)
- ✅ Pesquisa por cliente, email ou imóvel
- ✅ Níveis de prioridade (baixa, normal, alta, urgente)
- ✅ Estados das conversas (ativa, resolvida, arquivada)
- ✅ Info do cliente (nome, email, último acesso)
- ✅ Quick actions (enviar email, ver imóvel)
- ✅ Área de chat para responder

### 3. MESSAGING_SYSTEM.sql
**Localização:** `supabase/MESSAGING_SYSTEM.sql`

Schema da base de dados:
- `conversations` - Conversas com info do utilizador, imóvel, agente
- `chat_messages` - Mensagens com suporte a anexos e integração email
- `user_presence` - Estado online/offline dos utilizadores
- Triggers para auto-update de conversas
- Funções RPC para marcar como lido e atualizar presença

## Rotas Disponíveis

| Rota | Componente | Acesso |
|------|------------|--------|
| `#dashboard` → Tab "Mensagens" | UserMessaging | Utilizadores logados |
| `#conversations` | AdminConversations | Admin/Vendedor |
| `#messages` | MessagesInbox (antigo) | Admin/Vendedor |

## Como Usar

### Para Utilizadores (Clientes)
1. Fazer login no site
2. Aceder a `#dashboard`
3. Clicar no tab "Mensagens"
4. Ver conversas existentes ou iniciar nova

### Para Admin/Vendedor
1. Fazer login com conta admin/vendedor
2. Aceder a `#property-management`
3. Clicar no botão "Conversas" no header
4. OU aceder diretamente a `#conversations`

## Configuração da Base de Dados

### Passo 1: Executar SQL
Abrir o Supabase SQL Editor e executar o ficheiro:
```
supabase/MESSAGING_SYSTEM.sql
```

### Passo 2: Verificar Tabelas
Confirmar que foram criadas:
- `conversations`
- `chat_messages`
- `user_presence`

### Passo 3: Testar
Os dados demo serão criados automaticamente.

## Funcionalidades de Email Bridge (Futuro)

O schema já suporta integração email:

```sql
-- Na tabela conversations
email_thread_id TEXT  -- ID do thread de email

-- Na tabela chat_messages
email_message_id TEXT  -- ID do email original
is_from_email BOOLEAN  -- Se veio do email
```

### Para implementar email bridge:
1. **Webhook Inbound**: Receber emails via Resend/SendGrid/Mailgun
2. **Parse**: Extrair conteúdo e criar mensagem no chat
3. **Outbound**: Quando agente responde, enviar email ao cliente
4. **Thread**: Manter referência para agrupar emails na conversa

## Estrutura das Tabelas

### conversations
```sql
id UUID PRIMARY KEY
user_id TEXT NOT NULL
user_name TEXT
user_email TEXT
user_avatar TEXT
property_id TEXT
property_title TEXT
property_image TEXT
subject TEXT
assigned_agent TEXT
status TEXT (active/resolved/archived)
priority TEXT (low/normal/high/urgent)
last_message TEXT
last_message_at TIMESTAMP
last_message_by TEXT
user_unread_count INTEGER
agent_unread_count INTEGER
user_last_seen TIMESTAMP
email_thread_id TEXT
```

### chat_messages
```sql
id UUID PRIMARY KEY
conversation_id UUID
sender_id TEXT
sender_name TEXT
sender_avatar TEXT
sender_type TEXT (user/agent/system)
message TEXT
attachments JSONB
is_read BOOLEAN
read_at TIMESTAMP
email_message_id TEXT
is_from_email BOOLEAN
created_at TIMESTAMP
```

### user_presence
```sql
id UUID PRIMARY KEY
user_id TEXT UNIQUE
is_online BOOLEAN
last_seen TIMESTAMP
```

## Demo Data

O SQL inclui dados demo:
- 2 conversas de exemplo
- 9 mensagens distribuídas
- Diferentes estados e prioridades

## Tecnologias

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Icons**: Font Awesome
- **Presença**: Polling a cada 5-10 segundos

## Screenshots (Áreas)

### UserMessaging
- Sidebar com lista de conversas
- Área de chat com bolhas de mensagem
- Header com info do imóvel
- Input com botão de anexo

### AdminConversations
- Stats: Total, Por Responder, Urgentes, Online
- Lista de conversas com avatares e badges
- Indicadores de presença verde/cinza
- Filtros e pesquisa
- Chat para responder

## Melhorias Futuras

- [ ] Push notifications
- [ ] Typing indicators
- [ ] Envio de imagens/documentos
- [ ] Integração real de email (Resend/SendGrid)
- [ ] WebSockets para tempo real
- [ ] Respostas predefinidas
- [ ] Transferir conversa entre agentes
- [ ] Histórico de conversas arquivadas
- [ ] Exportar conversa como PDF
