// NOTE: Using generic string types to avoid drift with evolving Process type definitions.
// TODO: Align these constants with src/modules/process/types once enums are finalized.

export const PROCESS_STATUS: { value: string; label: string }[] = [
	{ value: 'active', label: 'Ativo' },
	{ value: 'undefined', label: 'Indefinido' },
	{ value: 'dismissed', label: 'Baixado' },
	{ value: 'closed', label: 'Encerrado' },
	{ value: 'suspended', label: 'Suspenso' },
	{ value: 'archived', label: 'Arquivado' },
]

export const PROCESS_AREAS: { value: string; label: string }[] = [
	{ value: 'civil', label: 'Cível' },
	{ value: 'labor', label: 'Trabalhista' },
	{ value: 'criminal', label: 'Criminal' },
	{ value: 'family', label: 'Família' },
	{ value: 'tax', label: 'Tributário' },
	{ value: 'administrative', label: 'Administrativo' },
	{ value: 'constitutional', label: 'Constitucional' },
	{ value: 'international', label: 'Internacional' },
]

export const PARTY_TYPES: {
	value: 'individual' | 'company' | 'government'
	label: string
}[] = [
	{ value: 'individual', label: 'Pessoa Física' },
	{ value: 'company', label: 'Pessoa Jurídica' },
	{ value: 'government', label: 'Governo' },
]
