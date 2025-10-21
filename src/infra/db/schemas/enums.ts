/**
 * PostgreSQL Enums for Drizzle ORM
 */

import { pgEnum } from 'drizzle-orm/pg-core'

// ===== CLIENT ENUMS =====

/**
 * Tipo de cliente
 * INDIVIDUAL: Pessoa física
 * COMPANY: Pessoa jurídica
 */
export const clientTypeEnum = pgEnum('client_type', ['INDIVIDUAL', 'COMPANY'])

/**
 * Status do cliente
 * LEAD: Lead/prospecto inicial
 * PROSPECT: Prospecto qualificado
 * ACTIVE: Cliente ativo
 * INACTIVE: Cliente inativo
 * ARCHIVED: Cliente arquivado
 */
export const clientStatusEnum = pgEnum('client_status', [
	'LEAD',
	'PROSPECT',
	'ACTIVE',
	'INACTIVE',
	'ARCHIVED',
])

// ===== PROCESS ENUMS =====

/**
 * Status
 * PENDING: Processo pendente de início
 * ACTIVE: Processo ativo/em andamento
 * SUSPENDED: Processo suspenso
 * ARCHIVED: Processo arquivado
 * CLOSED: Processo encerrado/finalizado
 */
export const processStatusEnum = pgEnum('process_status', [
	'PENDING',
	'ACTIVE',
	'SUSPENDED',
	'ARCHIVED',
	'CLOSED',
])

/**
 * Área jurídica do processo
 * Baseado nas principais áreas do direito brasileiro
 */
export const processAreaEnum = pgEnum('process_area', [
	'CIVIL',
	'CRIMINAL',
	'TRABALHISTA',
	'TRIBUTARIO',
	'ADMINISTRATIVO',
	'COMERCIAL',
	'FAMILIA',
	'SUCESSOES',
	'CONSUMIDOR',
	'AMBIENTAL',
])

/**
 * Prioridade do processo
 */
export const processPriorityEnum = pgEnum('process_priority', [
	'LOW',
	'MEDIUM',
	'HIGH',
	'URGENT',
])

// ===== DEADLINE ENUMS =====

export const deadlineTypeEnum = pgEnum('deadline_type', [
	'HEARING', // Audiência
	'APPEAL', // Recurso
	'RESPONSE', // Contestação/Resposta
	'PETITION', // Petição
	'DOCUMENT', // Entrega de documento
	'PAYMENT', // Pagamento
	'MEETING', // Reunião
	'OTHER', // Outros
])

export const deadlineStatusEnum = pgEnum('deadline_status', [
	'PENDING', // Pendente
	'IN_PROGRESS', // Em andamento
	'COMPLETED', // Concluído
	'MISSED', // Perdido/Atrasado
	'CANCELLED', // Cancelado
])

export const deadlinePriorityEnum = pgEnum('deadline_priority', [
	'LOW',
	'MEDIUM',
	'HIGH',
	'CRITICAL',
])

// ===== NOTIFICATION ENUMS =====

export const notificationChannelEnum = pgEnum('notification_channel', [
	'EMAIL',
	'SYSTEM', // Notificação no sistema
	'PUSH', // Push notification
	'SMS',
	'WHATSAPP',
])

export const notificationStatusEnum = pgEnum('notification_status', [
	'PENDING', // Pendente de envio
	'SENT', // Enviada
	'DELIVERED', // Entregue
	'READ', // Lida
	'FAILED', // Falha no envio
	'CANCELLED', // Cancelada
])

// ===== SPACE ENUMS =====

export const spaceTypeEnum = pgEnum('space_type', [
	'INDIVIDUAL', // Espaço individual
	'TEAM', // Equipe/time
	'FIRM', // Escritório
	'DEPARTMENT', // Departamento
])

// ===== PROFILE/USER ENUMS =====

export const profileTypeEnum = pgEnum('profile_type', [
	'ADMIN', // Administrador
	'LAWYER', // Advogado
	'ASSISTANT', // Assistente jurídico
	'CLIENT', // Cliente
	'PARALEGAL', // Paralegal
])

export const spaceRoleEnum = pgEnum('space_role', [
	'OWNER', // Proprietário
	'ADMIN', // Administrador
	'LAWYER', // Advogado
	'ASSISTANT', // Assistente
	'CLIENT', // Cliente
	'VIEWER', // Visualizador (somente leitura)
])
