import { RiGoogleFill } from '@remixicon/react'
import { Button } from '@/components/ui/button'

export function GoogleProvider() {
	return (
		<Button variant="outline" className="w-full bg-zinc-50 hover:bg-zinc-50">
			<RiGoogleFill className="mr-2 h-4 w-4" />
			Google
		</Button>
	)
}
