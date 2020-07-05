<template>
	<div>
		<v-form
			ref="form"
			v-model="valid"
			lazy-validation
		>
			<v-text-field
				v-model="password"
				:append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
				:rules="[passwordRules.required, passwordRules.min]"
				:type="show1 ? 'text' : 'password'"
				name="input-10-1"
				label="Hasło"
				hint="Minimum 8 znaków"
				counter
				@click:append="show1 = !show1"
			>
				<v-icon slot="prepend-inner">mdi-lock-question</v-icon>
			</v-text-field>

			<v-text-field
				label="Powtórz hasło"
				:append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
				:type="show1 ? 'text' : 'password'"
				v-model="confirmPassword"
				:rules="confirmPasswordRules.concat(passwordConfirmationRule)"
				required
				@click:append="show1 = !show1"
			>
				<v-icon slot="prepend-inner">mdi-lock-question</v-icon>
			</v-text-field>

			<v-btn
				:disabled="!valid"
				color="success"
				class="mt-8"
				@click="validate"
				:loading="loading"
			>
				Ustaw hasło
			</v-btn>
		</v-form>
	</div>
</template>

<script>

	export default {
		layout: 'auth',
		data: () => ({
			valid: true,
			loading: false,
			show1: false,
			password: '',
			passwordRules: {
				required: value => !!value || 'Hasło jest wymagane',
				min: v => v.length >= 8 || 'Minimum 8 znaków',
			},
			confirmPassword: '',
			confirmPasswordRules: [v => !!v || 'Powtórzenie hasła jest wymagane'],
		}),

		computed: {
			passwordConfirmationRule() {
				return () => this.password === this.confirmPassword || 'Hasła muszą być takie same';
			}
		},

		methods: {
			async validate () {
				if (this.$refs.form.validate()) {
					this.loading = 'loading';

					await this.$axios.post('/api/set-password', {
						token: this.$route.query.token,
						password: this.password,
						password_confirmation: this.confirmPassword
					});

					this.$router.push('/login');
				}
			},
		},
	}

</script>

<style lang="scss" scoped>
	.validation-error-message {
		height: 25px;

		margin-top: 10px;
		margin-bottom: 0;
	}
</style>
