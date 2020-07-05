<template>
	<div>
		<v-form
			v-if="!afterRegistration"
			ref="form"
			v-model="valid"
			lazy-validation
		>
			<v-text-field
				v-model="name"
				:rules="nameRules"
				label="Imię"
				clearable
				required
			>
				<v-icon slot="prepend-inner">mdi-account</v-icon>
			</v-text-field>
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
				class="mt-8 btn-registration"
				@click="validate"
				:loading="loading"
			>
				Stwórz konto
			</v-btn>
		</v-form>

		<p v-if="afterRegistration">
			Na podany adres e-mail został wysłany link aktywacyjny. Przejdź na adres podany w wiadomości, by
			aktywować konto.
		</p>
	</div>
</template>

<script>

	export default {
		layout: 'auth',
		transition: 'test',
		data: () => ({
			valid: true,
			loading: false,
			name: '',
			nameRules: [
				v => !!v || 'Imię jest wymagane'
			],
			email: '',
			emailRules: [
				v => !!v || 'E-mail jest wymagany',
				v => /.+@.+\..+/.test(v) || 'E-mail mieć odpowiedni format',
			],
			show1: false,
			password: '',
			passwordRules: {
				required: value => !!value || 'Hasło jest wymagane',
				min: v => v.length >= 8 || 'Minimum 8 znaków',
			},
			confirmPassword: '',
			confirmPasswordRules: [v => !!v || 'Powtórzenie hasła jest wymagane'],
			showValidationError: false,
			afterRegistration: false,
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

					await this.$store.dispatch('auth/registration', {
						name: this.name,
						email: this.email,
						password: this.password,
						password_confirmation: this.confirmPassword
					});

					this.afterRegistration = true;
				}
			},
		},
	}

</script>

<style lang="scss" scoped>

	.btn-registration {
		width: 100%;
	}

</style>
