<template>
	<v-app dark>
		<div class="auth-layout-content">
			<div class="auth-form">
				<img src="/img/logo.jpg" alt="Logo" class="auth-form__logo">

				<div class="auth-form__links-wrapper">
					<nuxt-link to="/login" class="auth-form__links-wrapper__link" exact>
						Login
					</nuxt-link>

					<nuxt-link to="/registration" class="auth-form__links-wrapper__link" exact>
						Rejestracja
					</nuxt-link>
				</div>

				<nuxt/>
			</div>
		</div>
	</v-app>
</template>

<script>
	export default {
		head () {
			return {
				titleTemplate: '%s - Zaloguj się',
			}
		},
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
			}
		}
	}
</script>

<style lang="scss" scoped>
	.auth-layout-content {
		width: 100%;
		height: 100%;

		background-image: url("~assets/img/auth-bg.jpg");
		background-repeat: no-repeat;
		background-position: center;
		background-size: cover;
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		align-items: center;

		width: 400px;

		box-sizing: border-box;
		margin: 3% auto 0 auto;
		padding: 15px;

		border-radius: 8px;

		background-color: #ffffff;

		&__logo {
			display: block;

			width: 200px;
			height: 84px;

			object-fit: contain;

			background-color: #fff;
		}

		&__links-wrapper {
			box-sizing: border-box;
			margin: 15px 0;

			&__link {
				display: inline-block;

				min-width: 150px;

				border-radius: 8px;

				background-color: #f2f2f2;

				text-align: center;

				transition: background-color .3s;
			}

			&__link.nuxt-link-exact-active {
				background-color: #dddddd;
			}
		}
	}

	@media (max-width: 490px) {
		.auth-layout-content {
			background-image: none;
		}

		.auth-form {
			width: 100%;

			&__links-wrapper {
				width: 100%;

				&__link {
					display: block;

					width: 100%;

					margin: 20px auto;
				}
			}
		}
	}

</style>
