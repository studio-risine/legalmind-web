import { PageHeaderWithBreadcrumb } from '@components/ui/page-header-breadcrumb'
import { createClient } from '@libs/supabase/server'
import { redirect } from 'next/navigation'

const breadcrumb = [
	{ label: 'Home', href: '/dashboard' },
	{ label: 'Onboarding', href: '/dashboard/onboarding' },
]

export default async function OnboardingPage() {
	const supabase = await createClient()

	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/error?reason=unauthenticated')
	}

	return (
		<div>
			<PageHeaderWithBreadcrumb breadcrumb={breadcrumb} />
			<div className="p-6">
				<div className="mx-auto max-w-2xl">
					<h1 className="mb-6 font-bold text-3xl">Bem-vindo ao LegalTrack!</h1>
					<div className="mb-8 rounded-lg bg-blue-50 p-6">
						<h2 className="mb-3 font-semibold text-blue-900 text-xl">
							Configure seu primeiro espaço de trabalho
						</h2>
						<p className="text-blue-800">
							Para começar a usar o LegalTrack, você precisa criar um espaço de
							trabalho. Um espaço é onde você organizará seus clientes,
							processos e equipe.
						</p>
					</div>

					<div className="space-y-4">
						<h3 className="font-semibold text-lg">
							O que você pode fazer em um espaço:
						</h3>
						<ul className="space-y-2 text-gray-600">
							<li className="flex items-start">
								<span className="mt-1.5 mr-2 h-2 w-2 rounded-full bg-green-500" />
								Gerenciar clientes e seus dados
							</li>
							<li className="flex items-start">
								<span className="mt-1.5 mr-2 h-2 w-2 rounded-full bg-green-500" />
								Acompanhar processos judiciais
							</li>
							<li className="flex items-start">
								<span className="mt-1.5 mr-2 h-2 w-2 rounded-full bg-green-500" />
								Controlar prazos e deadlines
							</li>
							<li className="flex items-start">
								<span className="mt-1.5 mr-2 h-2 w-2 rounded-full bg-green-500" />
								Colaborar com sua equipe
							</li>
						</ul>
					</div>

					<div className="mt-8">
						<button
							type="button"
							className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
						>
							Criar Meu Primeiro Espaço
						</button>
						<p className="mt-2 text-gray-500 text-sm">
							Você poderá criar quantos espaços precisar mais tarde.
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
