<template>
	<div>
		<v-form
			v-if="!afterReminder"
			ref="form"
			v-model="valid"
			lazy-validation
		>
			<v-text-field
				v-model="email"
				:rules="emailRules"
				label="E-mail"
				clearable
				required
			>
				<v-icon slot="prepend-inner">mdi-email-outline</v-icon>
			</v-text-field>

			<v-btn
				:disabled="!valid"
				color="success"
				class="mt-8 btn-password-reminder"
				@click="validate"
				:loading="loading"
			>
				Przypomnij hasło
			</v-btn>
		</v-form>

		<p v-if="afterReminder">
			Na podany adres e-mail został wysłany link, dzięki któremu ustawisz nowe hasło.
		</p>
	</div>
</template>

<script>

	export default {
		layout: 'auth',
		data: () => ({
			valid: true,
			email: '',
			emailRules: [
				v => !!v || 'E-mail jest wymagany',
				v => /.+@.+\..+/.test(v) || 'E-mail mieć odpowiedni format',
			],
			afterReminder: false,
			loading: false,
		}),

		methods: {
			async validate () {
				if (this.$refs.form.validate()) {
					this.loading = 'loading';

					await this.$axios.post('/api/remind-password', {
						email: this.email
					});

					this.afterReminder = true;
				}
			},
		},
	}

</script>

<style lang="scss" scoped>

	.btn-password-reminder {
		width: 100%;
	}

</style>
