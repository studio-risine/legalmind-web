import { Button } from '@components/ui/button'
import { RiGoogleFill } from '@remixicon/react'

export function GoogleProvider() {
	return (
		<Button className="w-full bg-zinc-50 hover:bg-zinc-50" variant="outline">
			<RiGoogleFill className="mr-2 h-4 w-4" />
			Google
		</Button>
	)
}
