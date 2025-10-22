import { env } from '@infra/env'
import { createClient } from '@supabase/supabase-js'
import { eq } from 'drizzle-orm'
import { db } from '.'
import { schema } from './schemas'

const supabase = createClient(
	env.NEXT_PUBLIC_SUPABASE_URL,
	env.SUPABASE_SCRET_KEY,
	{
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	},
)

async function seedUsers() {
	console.log('🌱 Seeding users only...\n')

	try {
		// Limpar dados existentes
		console.log('🧹 Cleaning existing data...')
		await db.delete(schema.accounts)

		const { data: existingUsers } = await supabase.auth.admin.listUsers()
		if (existingUsers?.users) {
			for (const user of existingUsers.users) {
				await supabase.auth.admin.deleteUser(user.id)
			}
		}
		console.log('✅ Cleanup complete\n')

		// Criar usuários de teste
		console.log('👤 Creating test users via Supabase Auth...\n')

		// Usuário 1: John Doe (com todos os campos)
		const { data: user1, error: error1 } = await supabase.auth.admin.createUser(
			{
				email: 'john.doe@example.com',
				password: 'TestPassword123!',
				email_confirm: true,
				user_metadata: {
					display_name: 'John Doe',
					name: 'John',
					last_name: 'Doe',
				},
			},
		)

		if (error1) {
			console.error('❌ Error creating john.doe:', error1)
			throw error1
		}
		console.log('✅ User created: john.doe@example.com')
		console.log(`   ID: ${user1.user?.id}`)
		console.log(
			`   Metadata: ${JSON.stringify(user1.user?.user_metadata, null, 2)}\n`,
		)

		// Usuário 2: Jane Smith (com todos os campos)
		const { data: user2, error: error2 } = await supabase.auth.admin.createUser(
			{
				email: 'jane.smith@example.com',
				password: 'TestPassword123!',
				email_confirm: true,
				user_metadata: {
					display_name: 'Jane Smith',
					name: 'Jane',
					last_name: 'Smith',
				},
			},
		)

		if (error2) {
			console.error('❌ Error creating jane.smith:', error2)
			throw error2
		}
		console.log('✅ User created: jane.smith@example.com')
		console.log(`   ID: ${user2.user?.id}`)
		console.log(
			`   Metadata: ${JSON.stringify(user2.user?.user_metadata, null, 2)}\n`,
		)

		// Usuário 3: Bob Johnson (sem last_name para testar fallback)
		const { data: user3, error: error3 } = await supabase.auth.admin.createUser(
			{
				email: 'bob.johnson@example.com',
				password: 'TestPassword123!',
				email_confirm: true,
				user_metadata: {
					display_name: 'Bob J',
					name: 'Bob Johnson',
				},
			},
		)

		if (error3) {
			console.error('❌ Error creating bob.johnson:', error3)
			throw error3
		}
		console.log('✅ User created: bob.johnson@example.com (without last_name)')
		console.log(`   ID: ${user3.user?.id}`)
		console.log(
			`   Metadata: ${JSON.stringify(user3.user?.user_metadata, null, 2)}\n`,
		)

		// Aguardar trigger processar
		console.log('⏳ Waiting for trigger to process...')
		await new Promise((resolve) => setTimeout(resolve, 2000))

		// Verificar sincronização
		console.log('\n📊 Checking accounts table synchronization...\n')
		const accounts = await db.select().from(schema.accounts)

		if (accounts.length === 0) {
			console.error('💥 FATAL: Trigger synchronization failed!')
			console.error('   No accounts were created in public.accounts')
			console.error('   Check the trigger status and function permissions\n')
			throw new Error('Trigger synchronization failed')
		}

		console.log(`✅ ${accounts.length} accounts synchronized successfully!\n`)
		console.log('📋 Accounts in database:')
		for (const account of accounts) {
			console.log(`\n   ID: ${account.id}`)
			console.log(`   Email: ${account.email}`)
			console.log(`   Display Name: ${account.displayName}`)
			console.log(`   Name: ${account.name}`)
			console.log(`   Last Name: ${account.lastName || '(empty)'}`)
		}

		// Testar UPDATE: Atualizar John Doe
		console.log('\n\n🔄 Testing UPDATE trigger...')
		console.log('Updating john.doe user metadata...\n')

		const { error: updateError } = await supabase.auth.admin.updateUserById(
			user1.user!.id,
			{
				user_metadata: {
					display_name: 'John Updated Doe',
					name: 'John Updated',
					last_name: 'Doe Updated',
				},
			},
		)

		if (updateError) {
			console.error('❌ Error updating user:', updateError)
			throw updateError
		}

		// Aguardar trigger processar UPDATE
		await new Promise((resolve) => setTimeout(resolve, 2000))

		// Verificar se UPDATE foi sincronizado
		const updatedAccount = await db
			.select()
			.from(schema.accounts)
			.where(eq(schema.accounts.id, user1.user!.id))

		console.log('✅ User updated in auth.users')
		console.log('📋 Updated account in database:')
		console.log(`   Display Name: ${updatedAccount[0].displayName}`)
		console.log(`   Name: ${updatedAccount[0].name}`)
		console.log(`   Last Name: ${updatedAccount[0].lastName}\n`)

		console.log('🎉 User seed completed successfully!\n')
		console.log('📝 Summary:')
		console.log('   - Users created in auth.users: 3')
		console.log(`   - Accounts synchronized: ${accounts.length}`)
		console.log('   - UPDATE trigger tested: ✅\n')
	} catch (error) {
		console.error('\n💥 Seed failed:', error)
		throw error
	}
}

seedUsers()
	.catch((error) => {
		console.error('💥 Fatal error:', error)
		process.exit(1)
	})
	.finally(() => {
		console.log('Done!')
		process.exit(0)
	})
