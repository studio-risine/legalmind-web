import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { PageContent } from '@/components/ui/page-content'
import { CreateProcessForm } from '@/module/process/create-process-form'

export default function Page() {
	return (
		<PageContent>
			<Card className="mx-auto w-full max-w-2xl">
				<CardHeader>
					<CardTitle>Criar um process</CardTitle>
				</CardHeader>

				<CardContent>
					<CreateProcessForm />
				</CardContent>
				<CardFooter className="justify-end gap-4">
					<Button variant="ghost" size="sm">
						Cancelar
					</Button>
					<Button size="sm">Salvar</Button>
				</CardFooter>
			</Card>
		</PageContent>
	)
}
