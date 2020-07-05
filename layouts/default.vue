<template>
	<v-app dark>
		<div>
			<nuxt/>
		</div>
	</v-app>
</template>

<script>
	export default {
		middleware: ['redirect-to-login-page'],
		data() {
			return {
				items: [
					{
						icon: 'mdi-apps',
						title: 'Dashboard',
						to: '/'
					},
					{
						icon: 'mdi-cog',
						title: 'Ustawienia',
						to: '/settings'
					}
				],
				title: 'Wojciech Januszek',
			}
		}
	}
</script>

<style lang="scss" scoped>

</style>
