// NOTE: Using generic string types to avoid drift with evolving Process type definitions.
// TODO: Align these constants with src/modules/process/types once enums are finalized.

export const PROCESS_STATUS: {
	value: string
	label: string
}[] = [
	{ label: 'Ativo', value: 'active' },
	{ label: 'Indefinido', value: 'undefined' },
	{ label: 'Baixado', value: 'dismissed' },
	{ label: 'Encerrado', value: 'closed' },
	{ label: 'Suspenso', value: 'suspended' },
	{ label: 'Arquivado', value: 'archived' },
]

export const PROCESS_AREAS: {
	value: string
	label: string
}[] = [
	{ label: 'Cível', value: 'civil' },
	{ label: 'Trabalhista', value: 'labor' },
	{ label: 'Criminal', value: 'criminal' },
	{ label: 'Família', value: 'family' },
	{ label: 'Tributário', value: 'tax' },
	{ label: 'Administrativo', value: 'administrative' },
	{ label: 'Constitucional', value: 'constitutional' },
	{ label: 'Internacional', value: 'international' },
]

export const PARTY_TYPES: {
	value: 'individual' | 'company' | 'government'
	label: string
}[] = [
	{ label: 'Pessoa Física', value: 'individual' },
	{ label: 'Pessoa Jurídica', value: 'company' },
	{ label: 'Governo', value: 'government' },
]
