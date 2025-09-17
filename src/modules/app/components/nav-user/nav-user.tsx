'use client'

import { useAuth } from '@/contexts/auth-context'

// export interface NavUserProps {
// 	user: {
// 		name: string | null
// 		email: string | null
// 		avatar: string | null
// 	}
// }

export function NavUser() {
	const { user } = useAuth()
	console.log(user)
	// const { firstName, displayName, email, avatar } =
	// 	convertUserToNavUserDto(user)
	// const { name, email, avatar } = convertUserToUserDto(user)

	// console.log(firstName, displayName, email, avatar)

	// const { isMobile } = useSidebar()
	// const { redirectTo } = useRedirect()

	// const handleSignOut = async () => {
	// 	const result = await signOut()

	// 	if (result.tag === 'right') {
	// 		redirectTo({
	// 			route: result.right.redirect,
	// 		})
	// 	} else {
	// 		console.error(result.left.message)
	// 	}
	// }

	return (
		<h1>{user?.email}</h1>
		// <SidebarMenu>
		// 	<SidebarMenuItem>
		// 		<DropdownMenu>
		// 			<DropdownMenuTrigger asChild>
		// 				<SidebarMenuButton
		// 					size="lg"
		// 					className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
		// 				>
		// 					<Avatar className="h-8 w-8 rounded-lg">
		// 						<AvatarImage src={avatar ?? ''} alt={name ?? ''} />
		// 						<AvatarFallback className="rounded-lg">
		// 							{getAvatarInitials(name ?? '')}
		// 						</AvatarFallback>
		// 					</Avatar>

		// 					<div className="grid flex-1 text-left text-sm leading-tight">
		// 						<span className="truncate font-medium">{name}</span>
		// 						<span className="truncate text-xs">{email}</span>
		// 					</div>
		// 					<ChevronsUpDown className="ml-auto size-4" />
		// 				</SidebarMenuButton>
		// 			</DropdownMenuTrigger>
		// 			<DropdownMenuContent
		// 				className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
		// 				side={isMobile ? 'bottom' : 'right'}
		// 				align="end"
		// 				sideOffset={4}
		// 			>
		// 				<DropdownMenuLabel className="p-0 font-normal">
		// 					<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
		// 						<Avatar className="h-8 w-8 rounded-lg">
		// 							<AvatarImage src={avatar ?? ''} alt={name ?? ''} />
		// 							<AvatarFallback className="rounded-lg">
		// 								{getAvatarInitials(name ?? '')}
		// 							</AvatarFallback>
		// 						</Avatar>
		// 						<div className="grid flex-1 text-left text-sm leading-tight">
		// 							<span className="truncate font-medium">{name}</span>
		// 							<span className="truncate text-xs">{email}</span>
		// 						</div>
		// 					</div>
		// 				</DropdownMenuLabel>
		// 				<DropdownMenuSeparator />
		// 				<DropdownMenuGroup>
		// 					<DropdownMenuItem>
		// 						<Sparkles />
		// 						Upgrade to Pro
		// 					</DropdownMenuItem>
		// 				</DropdownMenuGroup>
		// 				<DropdownMenuSeparator />
		// 				<DropdownMenuGroup>
		// 					<DropdownMenuItem>
		// 						<BadgeCheck />
		// 						Account
		// 					</DropdownMenuItem>
		// 					<DropdownMenuItem>
		// 						<CreditCard />
		// 						Billing
		// 					</DropdownMenuItem>
		// 					<DropdownMenuItem>
		// 						<Bell />
		// 						Notifications
		// 					</DropdownMenuItem>
		// 				</DropdownMenuGroup>
		// 				<DropdownMenuSeparator />
		// 				<DropdownMenuItem onClick={handleSignOut}>
		// 					<LogOut />
		// 					Log out
		// 				</DropdownMenuItem>
		// 			</DropdownMenuContent>
		// 		</DropdownMenu>
		// 	</SidebarMenuItem>
		// </SidebarMenu>
	)
}
