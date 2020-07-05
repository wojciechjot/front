<template>
	<div>
		<p>Konto zostało aktywowane. Możesz się teraz zalogować.</p>
	</div>
</template>

<script>
    export default {
        layout: 'auth',
		async asyncData({ $axios, query, redirect }) {
        	try {
				const url = '/api/enable-user/' + query.token;

				await $axios.$post(url);
			} catch {
				redirect('/login');
			}
		},
    }
</script>

<style lang="scss" scoped>

</style>
