import { createLoader, parseAsString } from 'nuqs/server'

// Defina os parâmetros de busca (query string) que você deseja usar
// Exemplo: /space/123/configuracoes?tab=account&section=profile
export const searchParams = {
	// Adicione aqui os parâmetros da query string que você precisa
	// Por exemplo, se quiser filtrar por tab:
	tab: parseAsString.withDefault('geral'),
}

// Crie o loader para usar nos server components
export const loadSearchParams = createLoader(searchParams)
