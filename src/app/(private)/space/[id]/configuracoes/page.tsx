import { Button } from '@components/ui/button'
import { Card, CardContent } from '@components/ui/card'
import { Input } from '@components/ui/input'
import { ItemRow } from '@components/ui/list-row'
import { MainContent } from '@components/ui/main-content'
import { HeaderBreadcrumb } from '@modules/space/components'
import { getSpaceIdFromHeaders } from '@modules/space/http/get-space-id-headers'

export default async function Page() {
	const spaceId = await getSpaceIdFromHeaders()

	const breadcrumb = [
		{ href: `/space/${spaceId}`, label: 'Home' },
		{
			href: `/space/${spaceId}/configuracoes`,
			label: 'Configurações',
		},
	]

	return (
		<>
			<HeaderBreadcrumb items={breadcrumb} />

			<MainContent size="sm">
				<header className="mb-4">
					<h1 className="mb-0 font-bold text-2xl text-foreground">
						Configurações
					</h1>
				</header>

				<section>
					<header className="mb-4">
						<h2 className="mb-0 font-bold text-foreground text-xl">Conta</h2>
						<span className="text-muted-foreground">
							Altere suas informações básicas
						</span>
					</header>

					<Card className="py-0">
						<CardContent className="divide-y px-4 py-0">
							<ItemRow description="" title="Foto de Perfil">
								<Input />
							</ItemRow>
							<ItemRow
								description="Como será exibido e identificado"
								title="Nome"
							>
								<Input />
							</ItemRow>

							<ItemRow title="Telefone">
								<Input />
							</ItemRow>
						</CardContent>
					</Card>
				</section>

				<section>
					<header className="mb-4">
						<h2 className="mb-0 font-bold text-foreground text-xl">
							Preferências
						</h2>
					</header>
					<div>
						<div className="mb-2">
							<h3 className="mb-0 text-base text-foreground">
								Interface e Tema
							</h3>
						</div>
						<Card className="py-0">
							<CardContent className="divide-y px-4 py-0">
								<ItemRow
									description="Escolha entre claro, escuro ou automático"
									title="Modo de cor"
								>
									<Input />
								</ItemRow>
							</CardContent>
						</Card>
					</div>
				</section>

				<section>
					<header className="mb-4">
						<h2 className="mb-0 font-bold text-foreground text-xl">Space</h2>
					</header>
					<main className="space-y-4">
						<Card className="py-0">
							<CardContent className="divide-y px-4 py-0">
								<ItemRow
									description="Como será exibido e identificado"
									title="Nome"
								>
									<Input />
								</ItemRow>

								<ItemRow title="Telefone">
									<Input />
								</ItemRow>
							</CardContent>
						</Card>

						<Card className="py-0">
							<CardContent className="divide-y px-4 py-0">
								<ItemRow
									description="Esta ação é irreversível"
									title="Excluir Space"
								>
									<Button variant="destructive">Excluir</Button>
								</ItemRow>
							</CardContent>
						</Card>
					</main>
				</section>
			</MainContent>
		</>
	)
}
