export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[]

export type Database = {
	// Allows to automatically instantiate createClient with right options
	// instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
	__InternalSupabase: {
		PostgrestVersion: '13.0.4'
	}
	public: {
		Tables: {
			_prisma_migrations: {
				Row: {
					applied_steps_count: number
					checksum: string
					finished_at: string | null
					id: string
					logs: string | null
					migration_name: string
					rolled_back_at: string | null
					started_at: string
				}
				Insert: {
					applied_steps_count?: number
					checksum: string
					finished_at?: string | null
					id: string
					logs?: string | null
					migration_name: string
					rolled_back_at?: string | null
					started_at?: string
				}
				Update: {
					applied_steps_count?: number
					checksum?: string
					finished_at?: string | null
					id?: string
					logs?: string | null
					migration_name?: string
					rolled_back_at?: string | null
					started_at?: string
				}
				Relationships: []
			}
			clients: {
				Row: {
					address: Json | null
					createdAt: string
					document: string | null
					email: string | null
					id: string
					metadata: Json | null
					name: string
					notes: string | null
					phone: string | null
					status: Database['public']['Enums']['ClientStatus']
					updatedAt: string
				}
				Insert: {
					address?: Json | null
					createdAt?: string
					document?: string | null
					email?: string | null
					id: string
					metadata?: Json | null
					name: string
					notes?: string | null
					phone?: string | null
					status?: Database['public']['Enums']['ClientStatus']
					updatedAt: string
				}
				Update: {
					address?: Json | null
					createdAt?: string
					document?: string | null
					email?: string | null
					id?: string
					metadata?: Json | null
					name?: string
					notes?: string | null
					phone?: string | null
					status?: Database['public']['Enums']['ClientStatus']
					updatedAt?: string
				}
				Relationships: []
			}
			organizations: {
				Row: {
					createdAt: string
					description: string | null
					id: string
					logo: string | null
					name: string
					settings: Json | null
					slug: string
					updatedAt: string
				}
				Insert: {
					createdAt?: string
					description?: string | null
					id: string
					logo?: string | null
					name: string
					settings?: Json | null
					slug: string
					updatedAt: string
				}
				Update: {
					createdAt?: string
					description?: string | null
					id?: string
					logo?: string | null
					name?: string
					settings?: Json | null
					slug?: string
					updatedAt?: string
				}
				Relationships: []
			}
			processes: {
				Row: {
					area: Database['public']['Enums']['ProcessArea']
					assigned_lawyer_id: string | null
					client_id: string | null
					createdAt: string
					description: string | null
					id: string
					metadata: Json | null
					priority: Database['public']['Enums']['ProcessPriority']
					public_id: string
					status: Database['public']['Enums']['ProcessStatus']
					tags: string[] | null
					title: string
					updatedAt: string
				}
				Insert: {
					area: Database['public']['Enums']['ProcessArea']
					assigned_lawyer_id?: string | null
					client_id?: string | null
					createdAt?: string
					description?: string | null
					id: string
					metadata?: Json | null
					priority?: Database['public']['Enums']['ProcessPriority']
					public_id: string
					status?: Database['public']['Enums']['ProcessStatus']
					tags?: string[] | null
					title: string
					updatedAt: string
				}
				Update: {
					area?: Database['public']['Enums']['ProcessArea']
					assigned_lawyer_id?: string | null
					client_id?: string | null
					createdAt?: string
					description?: string | null
					id?: string
					metadata?: Json | null
					priority?: Database['public']['Enums']['ProcessPriority']
					public_id?: string
					status?: Database['public']['Enums']['ProcessStatus']
					tags?: string[] | null
					title?: string
					updatedAt?: string
				}
				Relationships: [
					{
						foreignKeyName: 'processes_client_id_fkey'
						columns: ['client_id']
						isOneToOne: false
						referencedRelation: 'clients'
						referencedColumns: ['id']
					},
				]
			}
			profile_spaces: {
				Row: {
					createdAt: string
					id: string
					invitedAt: string | null
					isActive: boolean
					joinedAt: string | null
					permissions: Json | null
					profile_id: string
					role: Database['public']['Enums']['SpaceRole']
					settings: Json | null
					space_id: string
					updatedAt: string
				}
				Insert: {
					createdAt?: string
					id: string
					invitedAt?: string | null
					isActive?: boolean
					joinedAt?: string | null
					permissions?: Json | null
					profile_id: string
					role: Database['public']['Enums']['SpaceRole']
					settings?: Json | null
					space_id: string
					updatedAt: string
				}
				Update: {
					createdAt?: string
					id?: string
					invitedAt?: string | null
					isActive?: boolean
					joinedAt?: string | null
					permissions?: Json | null
					profile_id?: string
					role?: Database['public']['Enums']['SpaceRole']
					settings?: Json | null
					space_id?: string
					updatedAt?: string
				}
				Relationships: []
			}
			profiles: {
				Row: {
					bio: string | null
					createdAt: string
					id: string
					oab_number: string | null
					settings: Json | null
					specialties: string[] | null
					type: Database['public']['Enums']['ProfileType']
					updatedAt: string
					user_id: string
				}
				Insert: {
					bio?: string | null
					createdAt?: string
					id: string
					oab_number?: string | null
					settings?: Json | null
					specialties?: string[] | null
					type?: Database['public']['Enums']['ProfileType']
					updatedAt: string
					user_id: string
				}
				Update: {
					bio?: string | null
					createdAt?: string
					id?: string
					oab_number?: string | null
					settings?: Json | null
					specialties?: string[] | null
					type?: Database['public']['Enums']['ProfileType']
					updatedAt?: string
					user_id?: string
				}
				Relationships: []
			}
			spaces: {
				Row: {
					createdAt: string
					description: string | null
					id: string
					name: string
					organization_id: string | null
					settings: Json | null
					slug: string
					type: Database['public']['Enums']['SpaceType']
					updatedAt: string
				}
				Insert: {
					createdAt?: string
					description?: string | null
					id: string
					name: string
					organization_id?: string | null
					settings?: Json | null
					slug: string
					type?: Database['public']['Enums']['SpaceType']
					updatedAt: string
				}
				Update: {
					createdAt?: string
					description?: string | null
					id?: string
					name?: string
					organization_id?: string | null
					settings?: Json | null
					slug?: string
					type?: Database['public']['Enums']['SpaceType']
					updatedAt?: string
				}
				Relationships: []
			}
			users: {
				Row: {
					avatar: string | null
					createdAt: string
					display_name: string | null
					email: string
					first_name: string
					id: string
					isActive: boolean
					last_name: string
					phone: string | null
					role: Database['public']['Enums']['UserRoleType'] | null
					supabase_id: string | null
					updatedAt: string
				}
				Insert: {
					avatar?: string | null
					createdAt?: string
					display_name?: string | null
					email: string
					first_name: string
					id: string
					isActive?: boolean
					last_name: string
					phone?: string | null
					role?: Database['public']['Enums']['UserRoleType'] | null
					supabase_id?: string | null
					updatedAt: string
				}
				Update: {
					avatar?: string | null
					createdAt?: string
					display_name?: string | null
					email?: string
					first_name?: string
					id?: string
					isActive?: boolean
					last_name?: string
					phone?: string | null
					role?: Database['public']['Enums']['UserRoleType'] | null
					supabase_id?: string | null
					updatedAt?: string
				}
				Relationships: []
			}
		}
		Views: {
			[_ in never]: never
		}
		Functions: {
			[_ in never]: never
		}
		Enums: {
			ClientStatus: 'LEAD' | 'PROSPECT' | 'ACTIVE' | 'DORMANT' | 'CHURNED'
			ProcessArea:
				| 'CIVIL'
				| 'LABOR'
				| 'CRIMINAL'
				| 'FAMILY'
				| 'TAX'
				| 'ADMINISTRATIVE'
				| 'CONSTITUTIONAL'
				| 'INTERNATIONAL'
			ProcessPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
			ProcessStatus: 'ONGOING' | 'SUSPENDED' | 'ARCHIVED' | 'CLOSED'
			ProfileType: 'ADMIN' | 'LAWYER' | 'ASSISTANT' | 'CLIENT'
			SpaceRole: 'ADMIN' | 'LAWYER' | 'ASSISTANT' | 'CLIENT' | 'VIEWER'
			SpaceType: 'INDIVIDUAL'
			UserRoleType: 'ADMIN' | 'LAWYER'
		}
		CompositeTypes: {
			[_ in never]: never
		}
	}
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
			Row: infer R
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
				DefaultSchema['Views'])
		? (DefaultSchema['Tables'] &
				DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R
			}
			? R
			: never
		: never

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema['Tables']
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Insert: infer I
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
		? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I
			}
			? I
			: never
		: never

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema['Tables']
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Update: infer U
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
		? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U
			}
			? U
			: never
		: never

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema['Enums']
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
		? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
		: never

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema['CompositeTypes']
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
		: never = never,
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
		? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
		: never

export const Constants = {
	public: {
		Enums: {
			ClientStatus: ['LEAD', 'PROSPECT', 'ACTIVE', 'DORMANT', 'CHURNED'],
			ProcessArea: [
				'CIVIL',
				'LABOR',
				'CRIMINAL',
				'FAMILY',
				'TAX',
				'ADMINISTRATIVE',
				'CONSTITUTIONAL',
				'INTERNATIONAL',
			],
			ProcessPriority: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
			ProcessStatus: ['ONGOING', 'SUSPENDED', 'ARCHIVED', 'CLOSED'],
			ProfileType: ['ADMIN', 'LAWYER', 'ASSISTANT', 'CLIENT'],
			SpaceRole: ['ADMIN', 'LAWYER', 'ASSISTANT', 'CLIENT', 'VIEWER'],
			SpaceType: ['INDIVIDUAL'],
			UserRoleType: ['ADMIN', 'LAWYER'],
		},
	},
} as const
