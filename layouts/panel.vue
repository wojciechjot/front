<template>
	<v-app dark>
		<div class="app-wrapper">
			<nav ref="navigation" class="navigation navigation__active">
				<img src="/img/logo.jpg" alt="Logo" class="navigation__logo">

				<ul>
					<li v-for="(item, i) in items" :key="i" class="navigation__list-element">
						<nuxt-link
							:to="item.to"
							class="navigation__link"
							exact
							@click.native="hideNavigationIfMobile"
						>
							<img
								:src="item.icon"
								alt="Icon made by icon king from www.freeicons.io"
								class="navigation__link__icon"
							>

							{{ item.title }}
						</nuxt-link>
					</li>
				</ul>
			</nav>

			<div class="mobile-shadow-layer" @click="hideNavigation"></div>

			<div ref="pageWrapper" class="page-wrapper">
				<div class="app-bar">
					<v-btn
						class="mx-2"
						fab
						dark
						color="grey"
						x-small
						@click="hideNavigation"
					>
						<v-icon dark>mdi-format-list-bulleted-square</v-icon>
					</v-btn>

					<nuxt-link to="/" @click.native="onLogout">Wyloguj</nuxt-link>
				</div>

				<div class="page-content">
					<nuxt/>
				</div>
			</div>
		</div>
	</v-app>
</template>

<script>
	export default {
		name: "panel",
		middleware: ['check-auth', 'auth'],
		data() {
			return {
				items: [
					{
						icon: '/icons/dashboard.svg',
						title: 'Dashboard',
						to: '/panel'
					},
					{
						icon: '/icons/posts.svg',
						title: 'Posty',
						to: '/panel/posts'
					},
				],
				logoutTitle: 'Wyloguj'
			}
		},
		methods: {
			onLogout() {
				this.$store.dispatch('auth/logout');
			},
			hideNavigation() {
				this.$refs['pageWrapper'].classList.toggle('page-wrapper__full-width');
				this.$refs['navigation'].classList.toggle('navigation__active');
			},
			hideNavigationIfMobile() {
				if (window.innerWidth < 1000) {
					this.hideNavigation();
				}
			}
		},
		mounted() {
			this.hideNavigationIfMobile();
		}
	}
</script>

<style lang="scss" scoped>
	.app-wrapper {
		display: flex;

		height: 100%;
	}

	.navigation {
		display: none;

		width: 240px;

		background-color: #cfcfcf;

		&__active {
			display: block;
		}

		&__logo {
			display: block;

			width: 100%;
			height: 84px;

			object-fit: contain;

			background-color: #fff;
		}

		&__link {
			display: flex;
			align-items: center;

			padding-left: 10px;

			line-height: 3;
			color: #fff;

			transition: background-color .2s;

			&__icon {
				display: inline-block;

				$dimension: 20px;
				width: $dimension;
				height: $dimension;

				padding-bottom: 2px;
				margin-right: 10px;
			}
		}

		&__link:hover {
			background-color: #a3a3a3;
		}

		& .nuxt-link-exact-active {
			background: #8b8b8b;
		}
	}

	.mobile-shadow-layer {
		visibility: hidden;

		opacity: 0;

		transition: opacity .2s;
	}

	.page-wrapper {
		width: calc(100% - 240px);

		&__full-width {
			width: 100%;
		}
	}

	.app-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;

		padding-right: 30px;

		line-height: 3;

		background: #ececec;
	}

	.panel-background {
		width: 95%;
		min-height: 85vh;

		box-sizing: border-box;
		margin: 20px auto;
		padding: 20px;

		border: 1px solid #f2f2f2;
		border-radius: 8px;

		background: #fcfcfc;
	}

	@media (max-width: 1000px) {
		.navigation {
			display: block;

			position: fixed;
			top: 0;
			bottom: 0;

			z-index: 999;

			transform: translateX(-240px);

			transition: transform .2s;

			&__active {
				transform: translateX(0);
			}
		}

		.navigation__active + .mobile-shadow-layer {
			position: absolute;

			visibility: visible;

			top: 0;

			left: 0;
			width: 100vw;

			height: 100%;

			background-color: rgba(0, 0, 0, .5);

			opacity: 1;

			z-index: 998;
		}

		.page-wrapper {
			width: 100%;
		}
	}

</style>
