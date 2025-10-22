# Migração de Sincronização de Usuários

## 📋 Descrição

Esta migração reintroduz a funcionalidade crítica de sincronização automática entre `auth.users` e `public.accounts`. Quando um novo usuário é criado no sistema de autenticação do Supabase, um registro correspondente é criado automaticamente na tabela `accounts` com o mesmo ID.

## 🎯 Componentes

### 1. Função PostgreSQL: `handle_new_user()`

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.accounts (id, email, display_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. Trigger: `on_auth_user_created`

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 🚀 Como Aplicar

### Aplicação via Supabase CLI (Recomendado)

```bash
# Resetar o banco de dados e aplicar todas as migrações
supabase db reset

# Ou aplicar apenas as novas migrações
supabase db push
```

O Supabase automaticamente detectará e aplicará o arquivo de migração `0001_reintroduce_user_sync_trigger.sql`.

### Aplicação Manual via Supabase Dashboard

1. Acesse o Supabase Dashboard
2. Vá para SQL Editor
3. Cole o conteúdo do arquivo `src/infra/db/migrations/0001_reintroduce_user_sync_trigger.sql`
4. Execute o SQL

## ✅ Verificação

Após aplicar a migração via `supabase db reset`, verifique se está funcionando:

```sql
-- Verificar se a função existe
SELECT EXISTS (
  SELECT 1 FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public' AND p.proname = 'handle_new_user'
) as function_exists;

-- Verificar se o trigger existe
SELECT EXISTS (
  SELECT 1 FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'auth' 
  AND c.relname = 'users' 
  AND t.tgname = 'on_auth_user_created'
) as trigger_exists;
```

## 🧪 Teste

Para testar se está funcionando:

1. Crie um novo usuário via Supabase Auth (Dashboard ou API)
2. Verifique se um registro correspondente foi criado em `public.accounts`

```sql
-- Verificar sincronização
SELECT 
  au.id,
  au.email,
  pa.id as account_id,
  pa.email as account_email
FROM auth.users au
LEFT JOIN public.accounts pa ON au.id = pa.id
ORDER BY au.created_at DESC
LIMIT 5;
```

## 📁 Arquivos Envolvidos

- `src/infra/db/migrations/0001_reintroduce_user_sync_trigger.sql` - Migração SQL
- `src/infra/db/schemas/accounts.ts` - Schema da tabela accounts (sem $defaultFn no id)

## ⚠️ Notas Importantes

1. **ON CONFLICT DO NOTHING**: A função inclui `ON CONFLICT (id) DO NOTHING` para evitar erros se um usuário já tiver uma conta.

2. **SECURITY DEFINER**: A função é executada com privilégios do criador, permitindo que ela insira na tabela `accounts` mesmo quando chamada pelo trigger em `auth.users`.

3. **Display Name**: O `display_name` é extraído dos metadados do usuário com fallback para o nome de usuário (parte antes do @ do email).

## 🔧 Troubleshooting

### Erro: Função já existe
```bash
# Remover a função existente (se necessário)
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
```

### Erro: Trigger já existe
```bash
# Remover o trigger existente (se necessário)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
```

### Banco de dados não está rodando
```bash
# Iniciar Supabase local
supabase start

# Ou verificar o status
supabase status

# Resetar e aplicar todas as migrações
supabase db reset
```

## 📚 Referências

- [Documentação Original](docs/plans/replicate-auth-user-to-account.md)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
