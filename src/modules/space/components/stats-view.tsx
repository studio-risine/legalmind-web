'use client'

import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import { Card, CardContent, CardFooter } from '@components/ui/card'
import { cn } from '@libs/utils'
import {
	RiArrowRightBoxFill,
	RiArrowRightFill,
	RiArrowRightSFill,
	RiArrowRightSLine,
} from '@remixicon/react'
import { stat } from 'fs'
import { AlertTriangle, Check, ChevronRight, Eye } from 'lucide-react'
import Link from 'next/link'

// title, court, status, cnj number, parties, next hearing date
const data = [
	{
		id: '#',
		title: 'Barba admoneo coaegresco addo.',
		court: 'Tribunal de Justiça',
		cnj: '24573245084970918130',
		updatedAt: 'Aug 11, 2023',
		status: 'within',
	},
	{
		id: '#',
		title: 'Barba admoneo coaegresco addo.',
		court: 'Tribunal de Justiça',
		cnj: '24573245084970918130',
		updatedAt: 'Aug 11, 2023',
		status: 'within',
	},
	{
		id: '#',
		title: 'Barba admoneo coaegresco addo.',
		court: 'Tribunal de Justiça',
		cnj: '24573245084970918130',
		updatedAt: 'Aug 11, 2023',
		status: 'observe',
	},
]

type Stat = {
	name: string
	stat: string
	goalsAchieved: number
	status: 'observe' | 'within' | 'critical'
	href: string
}

export function Stats() {
	return (
		<div className="flex w-full items-center justify-center">
			<dl className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{data.map((item) => (
					<Link key={item.id} href={`/space/process/${item.id}`}>
						<Card
							key={item.title}
							className="group relative transition-colors duration-150 ease-in-out hover:bg-muted/50"
						>
							<CardContent className="group">
								<div className="relative flex w-full items-center justify-between truncate">
									<div className="flex flex-col gap-0.5">
										<dd className="font-semibold text-muted-foreground text-sm">
											Nome do cliente
										</dd>
										<dt className="font-medium text-base text-foreground">
											{item.title}
										</dt>
									</div>

									<RiArrowRightSLine className="size-4 shrink-0 text-muted-foreground/60 transition-transform duration-100 ease-linear group-hover:translate-x-1 group-hover:text-muted-foreground" />
								</div>
							</CardContent>

							<CardFooter>
								<div className="flex w-full items-center justify-between">
									<Badge variant="secondary">{item.court}</Badge>
									<Badge variant="secondary">Prazos court</Badge>
								</div>
							</CardFooter>
						</Card>
					</Link>
				))}
			</dl>
		</div>
	)
}
