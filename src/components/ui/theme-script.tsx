export function ThemeScript() {
	return (
		<script
			suppressHydrationWarning
			// biome-ignore lint/security/noDangerouslySetInnerHtml: Required for theme initialization
			dangerouslySetInnerHTML={{
				__html: `
					(function() {
						function getThemePreference() {
							if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
								return localStorage.getItem('theme')
							}
							return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
						}
						function setTheme(newTheme) {
							document.documentElement.classList.remove('light', 'dark')
							document.documentElement.classList.add(newTheme)
						}
						const theme = getThemePreference()
						setTheme(theme)
					})()
				`,
			}}
		/>
	)
}
