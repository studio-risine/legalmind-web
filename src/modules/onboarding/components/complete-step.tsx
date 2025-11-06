import { CheckCircle } from 'lucide-react'

interface CompleteOnboardingProps {
	spaceId: string
	spaceName: string
}

export function CompleteOnboarding() {
	// const handleComplete = () => {
	// 	router.push(`/space/${spaceId}`)
	// }

	return (
		<div className="flex flex-col items-center gap-6 text-center">
			<div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
				<CheckCircle className="h-8 w-8 text-green-600" />
			</div>

			<div className="space-y-2">
				<h3 className="font-semibold text-xl">Configuração concluída!</h3>
				<p className="text-muted-foreground">
					Sua conta foi configurada com sucesso e seu workspace está pronto para
					uso.
				</p>
			</div>

			<div className="space-y-4 text-muted-foreground text-sm">
				<div className="grid gap-2">
					<div className="flex items-center gap-2">
						<CheckCircle className="h-4 w-4 text-green-600" />
						<span>Informações da conta configuradas</span>
					</div>
					<div className="flex items-center gap-2">
						<CheckCircle className="h-4 w-4 text-green-600" />
						<span>Workspace criado com sucesso</span>
					</div>
					<div className="flex items-center gap-2">
						<CheckCircle className="h-4 w-4 text-green-600" />
						<span>Pronto para começar a usar</span>
					</div>
				</div>
			</div>

			{/* <Button onClick={handleComplete} size="lg" className="w-full max-w-xs">
				Acessar meu workspace
			</Button> */}
		</div>
	)
}
