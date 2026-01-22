# 🏠 Trata - Guia de Configuração Completo

Este guia explica passo a passo como configurar toda a plataforma Trata, desde o zero até à produção.

---

## 📋 Índice

1. [Pré-requisitos](#1-pré-requisitos)
2. [Configurar Supabase (Base de Dados)](#2-configurar-supabase-base-de-dados)
3. [Configurar o Projeto Local](#3-configurar-o-projeto-local)
4. [Configurar Autenticação Google](#4-configurar-autenticação-google)
5. [Configurar Sistema de Emails](#5-configurar-sistema-de-emails)
6. [Deploy no Vercel](#6-deploy-no-vercel)
7. [Configuração Final](#7-configuração-final)
8. [Resolução de Problemas](#8-resolução-de-problemas)

---

## 1. Pré-requisitos

Antes de começar, precisa de ter instalado:

### 1.1 Node.js

1. Vá a [nodejs.org](https://nodejs.org)
2. Faça download da versão **LTS** (Long Term Support)
3. Execute o instalador e siga as instruções
4. Para verificar se ficou instalado, abra o terminal e escreva:
   ```
   node --version
   ```
   Deve aparecer algo como `v18.x.x` ou superior

### 1.2 Git

1. Vá a [git-scm.com](https://git-scm.com)
2. Faça download e instale
3. Para verificar:
   ```
   git --version
   ```

### 1.3 Visual Studio Code (Recomendado)

1. Vá a [code.visualstudio.com](https://code.visualstudio.com)
2. Faça download e instale

### 1.4 Contas Necessárias

Crie contas gratuitas nos seguintes serviços:

| Serviço | Link | Para quê |
|---------|------|----------|
| GitHub | [github.com](https://github.com) | Guardar o código |
| Supabase | [supabase.com](https://supabase.com) | Base de dados |
| Vercel | [vercel.com](https://vercel.com) | Hosting do site |
| Google Cloud | [console.cloud.google.com](https://console.cloud.google.com) | Login com Google |
| Resend | [resend.com](https://resend.com) | Envio de emails |
| Brevo | [brevo.com](https://brevo.com) | Emails de marketing |

---

## 2. Configurar Supabase (Base de Dados)

### 2.1 Criar Projeto

1. Vá a [supabase.com](https://supabase.com) e faça login
2. Clique em **"New Project"**
3. Preencha:
   - **Name**: `trata` (ou outro nome)
   - **Database Password**: Crie uma password forte e **GUARDE-A**
   - **Region**: Escolha `West EU (Ireland)` para melhor performance em Portugal
4. Clique em **"Create new project"**
5. Aguarde 2-3 minutos enquanto o projeto é criado

### 2.2 Obter as Chaves de API

1. No seu projeto Supabase, vá a **Settings** (ícone engrenagem) → **API**
2. Copie e guarde num documento:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIs...` (chave longa)
   - **service_role key**: `eyJhbGciOiJIUzI1NiIs...` (outra chave longa)

⚠️ **IMPORTANTE**: A `service_role key` é secreta! Nunca partilhe ou coloque no código frontend.

### 2.3 Executar os Scripts SQL

Agora vamos criar as tabelas na base de dados.

1. No Supabase, vá a **SQL Editor** (menu lateral)
2. Clique em **"New query"**

#### Script 1: Criar tabela de utilizadores

Cole este código e clique em **"Run"**:

```sql
-- 001_create_users_table.sql
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'configurador')),
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Enable insert for authenticated users" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

GRANT ALL ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;
```

✅ Deve aparecer "Success. No rows returned"

#### Script 2: Criar tabela de propriedades

Crie nova query e cole:

```sql
-- 002_create_properties_table.sql
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12,2),
    location TEXT,
    address TEXT,
    property_type TEXT CHECK (property_type IN ('apartment', 'house', 'land', 'commercial', 'office')),
    bedrooms INT,
    bathrooms INT,
    area_sqm INT,
    images TEXT[],
    features TEXT[],
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold', 'rented')),
    owner_id UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available properties" ON public.properties 
    FOR SELECT USING (status = 'available' OR auth.uid() = owner_id);
CREATE POLICY "Admins can manage all properties" ON public.properties 
    FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'configurador')));

CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_location ON public.properties(location);
CREATE INDEX idx_properties_type ON public.properties(property_type);

GRANT ALL ON public.properties TO authenticated;
GRANT SELECT ON public.properties TO anon;
```

#### Script 3: Criar tabelas de chat

```sql
-- 005_add_missing_chat_tables.sql
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    admin_id UUID REFERENCES public.users(id),
    last_message TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    unread_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_presence (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Políticas para conversations
CREATE POLICY "Users can view own conversations" ON public.conversations
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = admin_id OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'configurador')));
CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON public.conversations
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = admin_id OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'configurador')));

-- Políticas para chat_messages
CREATE POLICY "Users can view messages in own conversations" ON public.chat_messages
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.conversations c 
        WHERE c.id = conversation_id AND (c.user_id = auth.uid() OR c.admin_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'configurador')))
    ));
CREATE POLICY "Users can send messages" ON public.chat_messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update own messages" ON public.chat_messages
    FOR UPDATE USING (auth.uid() = sender_id OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'configurador')));

-- Políticas para user_presence
CREATE POLICY "Anyone can view presence" ON public.user_presence FOR SELECT USING (true);
CREATE POLICY "Users can update own presence" ON public.user_presence FOR ALL USING (auth.uid() = user_id);

GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.chat_messages TO authenticated;
GRANT ALL ON public.user_presence TO authenticated;
```

#### Script 4: Criar tabela de favoritos

```sql
-- 007_fix_user_favorites.sql
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    property_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property ON public.user_favorites(property_id);

CREATE POLICY "Users can view own favorites" ON public.user_favorites
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites" ON public.user_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own favorites" ON public.user_favorites
    FOR DELETE USING (auth.uid() = user_id);

GRANT ALL ON public.user_favorites TO authenticated;
```

#### Script 5: Sistema de Emails (opcional mas recomendado)

Este script é maior. Copie o conteúdo do ficheiro `supabase/migrations/008_email_automation_system.sql` e execute.

### 2.4 Criar Utilizador Admin

Para ter acesso ao painel de administração:

```sql
-- Primeiro, registe-se no site com o seu email
-- Depois execute isto (substitua pelo seu email):
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'seu-email@exemplo.com';
```

---

## 3. Configurar o Projeto Local

### 3.1 Clonar o Repositório

1. Abra o terminal (PowerShell no Windows)
2. Navegue para onde quer guardar o projeto:
   ```
   cd C:\Users\SeuNome\Documents
   ```
3. Clone o projeto:
   ```
   git clone https://github.com/osecaadegas/Trata.git
   cd Trata
   ```

### 3.2 Instalar Dependências

```
npm install
```

Aguarde que todas as dependências sejam instaladas (pode demorar 1-2 minutos).

### 3.3 Configurar Variáveis de Ambiente

1. Na pasta do projeto, encontre o ficheiro `.env.example`
2. Copie-o e renomeie para `.env`:
   ```
   copy .env.example .env
   ```
3. Abra o ficheiro `.env` no VS Code e preencha:

```env
# Supabase (obtido no passo 2.2)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Google (configurar no passo 4)
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com

# Service key (APENAS para API - obtido no passo 2.2)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

### 3.4 Executar em Modo de Desenvolvimento

```
npm run dev
```

O site deve abrir em `http://localhost:5173`

🎉 **Parabéns!** O site está a funcionar localmente!

---

## 4. Configurar Autenticação Google

### 4.1 Criar Projeto no Google Cloud

1. Vá a [console.cloud.google.com](https://console.cloud.google.com)
2. Clique em **"Select a project"** → **"New Project"**
3. Nome: `Trata` → **"Create"**
4. Certifique-se que o projeto está selecionado

### 4.2 Configurar OAuth Consent Screen

1. No menu lateral: **APIs & Services** → **OAuth consent screen**
2. Escolha **"External"** → **"Create"**
3. Preencha:
   - **App name**: `Trata Imobiliária`
   - **User support email**: seu email
   - **Developer contact**: seu email
4. Clique **"Save and Continue"**
5. Em **Scopes**, clique **"Add or Remove Scopes"**
6. Selecione:
   - `email`
   - `profile`
   - `openid`
7. **"Save and Continue"** até finalizar

### 4.3 Criar Credenciais OAuth

1. Vá a **APIs & Services** → **Credentials**
2. Clique **"+ Create Credentials"** → **"OAuth client ID"**
3. Preencha:
   - **Application type**: `Web application`
   - **Name**: `Trata Web`
   - **Authorized JavaScript origins**:
     ```
     http://localhost:5173
     https://trata-lovat.vercel.app
     ```
   - **Authorized redirect URIs**:
     ```
     https://xxxxx.supabase.co/auth/v1/callback
     ```
     (substitua `xxxxx` pelo seu projeto Supabase)
4. Clique **"Create"**
5. **Copie o Client ID** (algo como `123456789-abc.apps.googleusercontent.com`)

### 4.4 Configurar no Supabase

1. No Supabase, vá a **Authentication** → **Providers**
2. Encontre **Google** e ative
3. Cole:
   - **Client ID**: o que copiou
   - **Client Secret**: também fornecido pelo Google
4. **Save**

### 4.5 Atualizar .env

Adicione ao seu `.env`:
```
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
```

---

## 5. Configurar Sistema de Emails

### 5.1 Resend (Emails Transacionais)

1. Vá a [resend.com](https://resend.com) e crie conta
2. Vá a **Settings** → **API Keys** → **Create API Key**
3. Copie a chave (começa com `re_`)
4. Vá a **Settings** → **Domains** → **Add Domain**
5. Adicione o seu domínio e siga as instruções DNS

### 5.2 Brevo (Emails de Marketing)

1. Vá a [brevo.com](https://brevo.com) e crie conta
2. Vá a **Settings** → **SMTP & API** → **API Keys**
3. Crie uma API key
4. Vá a **Contacts** → **Lists** → **Add a list**
5. Crie uma lista chamada "Alertas de Imóveis"
6. Anote o ID da lista (número)

### 5.3 Atualizar Variáveis de Ambiente

Adicione ao `.env`:
```env
RESEND_API_KEY=re_xxxxxxxxx
BREVO_API_KEY=xkeysib-xxxxxxxxx
BREVO_ALERTS_LIST_ID=1
ADMIN_EMAIL=info@seudominio.pt
FROM_EMAIL=noreply@seudominio.pt
FROM_NAME=Trata Imobiliária
SITE_URL=https://trata-lovat.vercel.app
WEBHOOK_SECRET=uma-string-aleatoria-segura
```

---

## 6. Deploy no Vercel

### 6.1 Conectar ao GitHub

1. Vá a [vercel.com](https://vercel.com) e faça login com GitHub
2. Clique em **"Add New..."** → **"Project"**
3. Encontre o repositório `Trata` e clique **"Import"**

### 6.2 Configurar Projeto

1. Em **Framework Preset**: deve detectar `Vite` automaticamente
2. Expanda **Environment Variables**
3. Adicione TODAS as variáveis do seu `.env`:

| Name | Value |
|------|-------|
| VITE_SUPABASE_URL | https://xxxxx.supabase.co |
| VITE_SUPABASE_ANON_KEY | eyJhbGciOi... |
| VITE_GOOGLE_CLIENT_ID | xxxxx.apps.googleusercontent.com |
| SUPABASE_SERVICE_ROLE_KEY | eyJhbGciOi... |
| RESEND_API_KEY | re_xxxxx |
| BREVO_API_KEY | xkeysib-xxxxx |
| BREVO_ALERTS_LIST_ID | 1 |
| ADMIN_EMAIL | info@seudominio.pt |
| FROM_EMAIL | noreply@seudominio.pt |
| FROM_NAME | Trata Imobiliária |
| SITE_URL | https://trata-lovat.vercel.app |
| WEBHOOK_SECRET | string-secreta |

4. Clique **"Deploy"**
5. Aguarde 2-3 minutos

### 6.3 Configurar Domínio (Opcional)

1. No projeto Vercel, vá a **Settings** → **Domains**
2. Adicione o seu domínio personalizado
3. Siga as instruções de configuração DNS

---

## 7. Configuração Final

### 7.1 Atualizar URLs no Google Cloud

Volte ao Google Cloud Console e atualize:
- **Authorized JavaScript origins**: adicione o URL do Vercel
- **Authorized redirect URIs**: já deve estar configurado

### 7.2 Atualizar URL no Supabase

1. No Supabase, vá a **Authentication** → **URL Configuration**
2. Adicione o URL do Vercel em **Site URL**
3. Adicione em **Redirect URLs**:
   ```
   https://seu-site.vercel.app/**
   ```

### 7.3 Testar Tudo

1. Aceda ao seu site no Vercel
2. Teste o login com Google
3. Teste criar uma propriedade (se for admin)
4. Teste o sistema de chat
5. Teste os favoritos
6. Teste o formulário de contacto

---

## 8. Resolução de Problemas

### ❌ "Invalid API Key" no Supabase

- Verifique se copiou a chave completa (são muito longas)
- Verifique se não há espaços antes/depois da chave
- Use a **anon key** no frontend, não a service_role

### ❌ Login Google não funciona

- Verifique se os URLs de redirect estão corretos
- Verifique se o Google Provider está ativado no Supabase
- Verifique se o Client ID está correto no `.env`

### ❌ Chat não funciona

- Execute o script SQL 005 e 006 no Supabase
- Verifique na consola do browser se há erros
- Verifique se está autenticado

### ❌ Favoritos não guardam

- Execute o script SQL 007 no Supabase
- Verifique se está autenticado (os favoritos são por utilizador)

### ❌ Emails não enviam

- Verifique as API keys do Resend/Brevo
- Verifique se o domínio está verificado
- Veja os logs no Vercel (Functions → Logs)

### ❌ Deploy falha no Vercel

- Verifique se todas as variáveis de ambiente estão definidas
- Veja os logs de build para erros específicos
- Teste localmente primeiro: `npm run build`

---

## 📞 Suporte

Se tiver problemas:

1. Verifique os logs no Vercel (Deployments → Ver logs)
2. Verifique a consola do browser (F12 → Console)
3. Verifique os logs no Supabase (Database → Logs)

---

## 🔄 Atualizações Futuras

Para atualizar o site após fazer alterações:

```bash
git add -A
git commit -m "Descrição das alterações"
git push
```

O Vercel irá automaticamente fazer deploy das alterações.

---

**Última atualização**: Janeiro 2026
