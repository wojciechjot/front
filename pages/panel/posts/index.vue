<template>
    <div class="panel-background">
		<client-only>
			<v-data-table
				:headers="headers"
				:items="posts"
				:options.sync="options"
				:server-items-length="totalPosts"
				:loading="loading"
				item-key="id"
				:footer-props="footerProps"
			>
				<template v-slot:top>
					<div class="data-table__top-header">
						<h2>Posty</h2>

						<v-btn
							color="primary"
							nuxt
							to="/panel/posts/new"
						>
							Dodaj post
						</v-btn>
					</div>

					<div class="search-bar">
						<v-text-field v-model="searchTitle" label=" " @keyup.enter="refreshItems" class="search-title">
							<v-icon slot="append" @click="refreshItems">mdi-magnify</v-icon>
						</v-text-field>

						<v-menu
							ref="menu"
							v-model="menu"
							:close-on-content-click="false"
							:return-value.sync="date"
							transition="scale-transition"
							offset-y
							min-width="290px"
						>
							<template v-slot:activator="{ on }">
								<v-text-field
									v-model="dateFormatted"
									label=" "
									readonly
									v-on="on"
									placeholder=" "
									class="search-date"
									:clearable=true
									@click:clear="refreshItemsByDateClear"
								/>
							</template>
							<v-date-picker
								v-model="date"
								no-title scrollable
								locale="pl"
								color="primary"
							>
								<v-spacer/>
								<v-btn text color="primary" @click="menu = false">Anuluj</v-btn>
								<v-btn text color="primary" @click="refreshItemsByDate(date)">OK</v-btn>
							</v-date-picker>
						</v-menu>
					</div>

				</template>

				<template v-slot:item="{ item }">
					<tr>
						<td class="data-table__row-title">
							<nuxt-link :to="'/panel/posts/' + item.id">{{ item.title }}</nuxt-link>
						</td>

						<td class="data-table__row-publication-date">
							{{ formatDate(item.publication_date) }}
						</td>

						<td class="data-table__row-actions">
							<v-btn
								x-small
								class="mr-2"
								color="green"
								nuxt
								:to="'/panel/posts/' + item.id"
								icon
							>
								<v-icon>mdi-pencil</v-icon>
							</v-btn>

							<v-btn
								x-small
								class="mr-2"
								color="red"
								icon
								@click="openDeleteDialog(item.id)"
							>
								<v-icon>mdi-delete</v-icon>
							</v-btn>
						</td>
					</tr>
				</template>
			</v-data-table>
		</client-only>

		<v-dialog
			v-model="dialog"
			max-width="290"
		>
			<v-card>
				<v-card-title class="headline">Czy na pewno chcesz usunąć ten post?</v-card-title>

				<v-card-actions>
					<v-spacer/>

					<v-btn
						color="blue-grey lighten-1"
						text
						@click="dialog = false"
					>
						Anuluj
					</v-btn>

					<v-btn
						color="error"
						@click="deleteItem"
					>
						Usuń
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
	export default {
		layout: 'panel',
		data: () => ({
			dialog: false,
			headers: [
				{ text: 'Tytuł', align: 'start', value: 'title' },
				{ text: 'Data dodania', value: 'publication_date' },
				{ text: 'Akcje', value: 'actions', sortable: false },
			],
			posts: [],
			options: {},
			loading: true,
			totalPosts: 0,
			footerProps: {
				itemsPerPageOptions: [10,20,30],
				itemsPerPageText: 'Ilość elementów na stronie',
				pageText: '{0}-{1} z {2}'
			},
			itemToDeleteId: '',
			searchTitle: '',
			date: '',
			dateFormatted: '',
			menu: false,
		}),

		watch: {
			dialog (value) {
				if (!value) {
					this.itemToDeleteId = '';
				}
			},
			options: {
				async handler () {
					let dataFromApi = await this.getDataFromApi();

					this.posts = dataFromApi.items;
					this.totalPosts = dataFromApi.total;
				},
				deep: true,
			},
			date () {
				this.dateFormatted = this.formatDate(this.date)
			},
		},

		methods: {
			async deleteItem () {
				const url = `/api/posts/${this.itemToDeleteId}`;

				const token = this.$store.state.auth.token;

				this.$axios.setToken(token, 'Bearer', ['delete']);

				await this.$axios.delete(url);

				this.$axios.setToken('', 'Bearer', ['delete']);

				const dataFromApi = await this.getDataFromApi();

				this.posts = dataFromApi.items;
				this.totalPosts = dataFromApi.total;

				this.dialog = false;
			},

			openDeleteDialog(id) {
				this.dialog = true;
				this.itemToDeleteId = id;
			},

			async getDataFromApi () {
				this.loading = true

				const { sortBy, sortDesc, page, itemsPerPage } = this.options;

				const token = this.$store.state.auth.token;
				const userId = this.$store.state.auth.user.id;

				this.$axios.setToken(token, 'Bearer', ['get']);

				let url = `/api/users/${userId}/posts?per_page=${itemsPerPage}&page=${page}`;

				if (sortBy.length === 1 && sortDesc.length === 1) {
					const sortType = sortDesc[0] ? 'desc' : 'asc';
					const sortOptions = `${sortBy[0]}.${sortType}`;

					url = `${url}&sort_by=${sortOptions}`;
				}

				if (this.searchTitle !== '') {
					url = `${url}&title__l=${this.searchTitle}`;
				}

				if (this.date !== '') {
					url = `${url}&publication_date__date=${this.date}`;
				}

				let postsRequest = await this.$axios.get(url);

				let items = postsRequest.data.data;
				const total = postsRequest.data.total;

				this.loading = false

				this.$axios.setToken('', 'Bearer', ['get']);

				return {
					items,
					total,
				};
			},
			refreshItems () {
				this.getDataFromApi().then((response) => {
					this.posts = response.items;
					this.totalPosts = response.total;
				})
			},
			refreshItemsByDate (date) {
				this.$refs.menu.save(date)
				this.getDataFromApi().then((response) => {
					this.posts = response.items;
					this.totalPosts = response.total;
				})
			},
			refreshItemsByDateClear () {
				this.date = '';

				this.getDataFromApi().then((response) => {
					this.posts = response.items;
					this.totalPosts = response.total;
				})
			},
		},
	}
</script>

<style lang="scss" scoped>
	.data-table__top-header {
		display: flex;
		justify-content: space-between;
	}

	.search-bar {
		box-sizing: border-box;

		padding-right: 16px;
	}

	.search-title, .search-date {
		display: inline-block;
	}

	.search-title {
		width: 70%;
	}

	.search-date {
		width: 150px;
		padding-left: 18px;
	}

	.theme--light .v-data-table {
		background: #fcfcfc;
	}

	.data-table__row-title {
		width: 70%;
	}
	.data-table__row-publication-date {
		width: 15%;
	}
	.data-table__row-actions {
		width: 15%;
	}

	@media (max-width: 1145px) {
		.data-table__row-title {
			width: 65%;
		}
		.data-table__row-publication-date {
			width: 20%;
		}
		.data-table__row-actions {
			width: 15%;
		}
	}

	@media (max-width: 705px) {
		.data-table__row-title {
			width: 55%;
		}
		.data-table__row-publication-date {
			width: 25%;
		}
		.data-table__row-actions {
			width: 20%;
		}
	}

	@media (max-width: 535px) {
		.data-table__row-title {
			width: 35%;
		}
		.data-table__row-publication-date {
			width: 35%;
		}
		.data-table__row-actions {
			width: 30%;
		}
	}

</style>
