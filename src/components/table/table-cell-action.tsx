import type { EntityType } from '@modules/dashboard/components/operation-context'
import { useOperation } from '@modules/dashboard/hooks/use-operation'
import { RiMoreFill } from '@remixicon/react'
import { Button } from '../ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '../ui/dropdown-menu'

// onEdit={(ids) =>
// 	// openOperation({
// 	// 	entity: 'client',
// 	// 	operation: 'edit',
// 	// 	id: ids[0],
// 	// })
// }
// onDelete={(id: string) =>
// 	// openOperation({
// 	// 	entity: 'client',
// 	// 	operation: 'delete',
// 	// 	onConfirm: async () => console.log('delete', id),
// 	// })
// }

export const TableCellAction = ({ entity }: { entity: EntityType }) => {
	const { onOpenOperation } = useOperation()

	if (!entity) return null

	const handleOpen = () => {
		onOpenOperation({
			entity,
			operation: 'open',
		})
	}

	const handleEdit = () => {
		onOpenOperation({
			entity,
			operation: 'edit',
		})
	}

	const handleDelete = () => {
		onOpenOperation({
			entity,
			operation: 'delete',
		})
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon">
					<RiMoreFill />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem onClick={handleOpen}>Open</DropdownMenuItem>
				<DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
				<DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
