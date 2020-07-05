<template>
	<v-form
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

		<p class="subtitle-1 red--text validation-error-message">
			<span>{{ validationErrorMessage }}</span>
		</p>

		<v-btn
			:disabled="!valid"
			color="success"
			class="mt-8 btn-login"
			@click="validate"
		>
			Zaloguj
		</v-btn>

		<nuxt-link to="/password-reminder" class="password-reminder-link" exact>
			Przypomnij hasło
		</nuxt-link>
	</v-form>
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
			show1: false,
			password: '',
			passwordRules: {
				required: value => !!value || 'Hasło jest wymagane',
				min: v => v.length >= 8 || 'Minimum  znaków',
			},
			showValidationError: false,
			validationErrorMessage: ''
		}),

		methods: {
			async validate () {
				if (this.$refs.form.validate()) {
					const requestStatus = await this.$store.dispatch('auth/authenticateUser', {
						email: this.email,
						password: this.password
					});

					if (requestStatus === 200) {
						await this.$router.push({ path: '/panel' });
					} else if (requestStatus >= 500 ){
						this.validationErrorMessage = 'Błąd serwera, proszę spróbować ponownie później';
					} else {
						this.validationErrorMessage = 'Nieprawidłowy adres e-mail lub hasło';
					}
				}
			},
		},
	}

</script>

<style lang="scss" scoped>

	.btn-login {
		width: 100%;
	}

	.password-reminder-link {
		display: block;

		box-sizing: border-box;
		margin-top: 15px;

		text-transform: uppercase;
		font-weight: bold;

		color: #7a7aff;
	}

	.validation-error-message {
		height: 25px;

		box-sizing: border-box;
		margin-top: 10px;
		margin-bottom: 0;
	}
</style>
