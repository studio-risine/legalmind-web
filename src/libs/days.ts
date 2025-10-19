import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import updateLocale from 'dayjs/plugin/updateLocale'

dayjs.extend(localizedFormat)
dayjs.extend(updateLocale)
dayjs.locale('pt-BR')

dayjs.updateLocale('pt-br', {
	monthsShort: [
		'Jan',
		'Fev',
		'Mar',
		'Abr',
		'Mai',
		'Jun',
		'Jul',
		'Ago',
		'Set',
		'Out',
		'Nov',
		'Dez',
	],
})

export { dayjs }
