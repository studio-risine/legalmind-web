import type {
	ProcessAreaType,
	ProcessPartyType,
	ProcessStatusType,
} from '@/types/process'

export const PROCESS_STATUS: { value: ProcessStatusType; label: string }[] = [
	{ value: 'active', label: 'Ativo' },
	{ value: 'undefined', label: 'Indefinido' },
	{ value: 'dismissed', label: 'Baixado' },
	{ value: 'closed', label: 'Encerrado' },
	{ value: 'suspended', label: 'Suspenso' },
	{ value: 'archived', label: 'Arquivado' },
]

export const PROCESS_AREAS: { value: ProcessAreaType; label: string }[] = [
	{ value: 'civil', label: 'Cível' },
	{ value: 'labor', label: 'Trabalhista' },
	{ value: 'criminal', label: 'Criminal' },
	{ value: 'family', label: 'Família' },
	{ value: 'tax', label: 'Tributário' },
	{ value: 'administrative', label: 'Administrativo' },
	{ value: 'constitutional', label: 'Constitucional' },
	{ value: 'international', label: 'Internacional' },
]

export const PARTY_TYPES: { value: ProcessPartyType; label: string }[] = [
	{ value: 'individual', label: 'Pessoa Física' },
	{ value: 'company', label: 'Pessoa Jurídica' },
	{ value: 'government', label: 'Governo' },
]
