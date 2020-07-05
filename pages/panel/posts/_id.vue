<template>
    <div class="panel-background form-wrapper">
		<v-form
			ref="form"
			v-model="valid"
			lazy-validation
			class="col-12"
		>
			<h1 class="title">Edytuj post</h1>

			<v-text-field
				v-model="title"
				:rules="titleRules"
				label="Tytuł"
				required
				placeholder=" "
				prepend-icon="mdi-format-title"
			/>

			<v-textarea
				name="content"
				label="Treść"
				placeholder=" "
				prepend-icon="mdi-card-text-outline"
				v-model="content"
			/>

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
						label="Data publikacji"
						readonly
						v-on="on"
						placeholder=" "
						prepend-icon="mdi-calendar"
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
					<v-btn text color="primary" @click="$refs.menu.save(date)">OK</v-btn>
				</v-date-picker>
			</v-menu>

			<v-menu
				ref="menuRange"
				v-model="menuRange"
				:close-on-content-click="false"
				:return-value.sync="dateRange"
				transition="scale-transition"
				offset-y
				min-width="290px"
			>
				<template v-slot:activator="{ on }">
					<v-text-field
						v-model="dateRangeText"
						label="Przedział czasu"
						readonly
						v-on="on"
						placeholder=" "
						prepend-icon="mdi-calendar"
					/>

				</template>
				<v-date-picker
					v-model="dateRange"
					no-title scrollable
					locale="pl"
					color="primary"
					range
				>
					<v-spacer/>
					<v-btn text color="primary" @click="menuRange = false">Anuluj</v-btn>
					<v-btn text color="primary" @click="$refs.menuRange.save(dateRange)">OK</v-btn>
				</v-date-picker>
			</v-menu>

			<v-file-input
				v-if="componentToUpdateKey"
				label="Obrazek"
				clearable
				show-size
				prepend-icon="mdi-file"
				placeholder="Kliknij by dodać obrazek"
				@change="onUpload"
				@click:clear="setPreviousImage"
				ref="fileInput"
				:key="componentToUpdateKey"
			/>

			<v-checkbox
				v-if="isDeletable()"
				v-model="isDelete"
				label="Usuń obrazek"
			/>

			<div v-if="hasImage()" class="post-image-wrapper">
				<img
					:src="previewImagePath"
					alt=""
					class="post-image"
				>
			</div>

			<v-btn
				:disabled="!valid"
				color="success"
				class="mt-8"
				@click="validate"
			>
				Zapisz
			</v-btn>
		</v-form>
	</div>
</template>

<script>
    export default {
        layout: 'panel',
		data: () => ({
			valid: true,
			title: '',
			titleRules: [
				v => !!v || 'Tytuł jest wymagany',
			],
			content: '',
			date: '',
			dateFormatted: '',
			menu: false,
			modal: false,
			dateRange: [],
			menuRange: false,
			image: null,
			previewImagePath: null,
			imageFile: null,
			isDelete: false,
			componentToUpdateKey: 1
		}),

		async asyncData({ $axios, params, store, redirect}) {
			const token = store.state.auth.token;
			$axios.setToken(token, 'Bearer', ['get']);

			const url = '/api/posts/' + params.id;

			try {
				const post = await $axios.$get(url);

				const title = post.title;
				const content = post.content;

				const publicationDate = post.publication_date;
				const [year, month, day] = publicationDate.split('-')
				const date =  publicationDate;
				const dateFormatted =  `${day}-${month}-${year}`;

				const dateRange = [post.beginning, post.end];
				const imageObject = post.image;
				let image = null;
				let previewImagePath = null;

				if (imageObject !== null) {
					image = imageObject;
					previewImagePath = imageObject.path;
				}

				$axios.setToken('', 'Bearer', ['get']);

				return {
					title,
					content,
					date,
					dateFormatted,
					dateRange,
					image,
					previewImagePath,
				}
			} catch (exception) {
				redirect('/panel/posts');
			}
		},

		computed: {
			dateRangeText () {
				return this.dateRange.map((dateRangeElement) => this.formatDate(dateRangeElement)).join(' ~ ')
			},
		},

		watch: {
			date () {
				this.dateFormatted = this.formatDate(this.date)
			},
		},

		methods: {
			async validate () {
				if (this.$refs.form.validate()) {
					const token = this.$store.state.auth.token;
					this.$axios.setToken(token, 'Bearer', ['post', 'put', 'delete']);

					const postId = this.$route.params.id;
					await this.$axios.put(`/api/posts/${postId}`, {
						title: this.title,
						content: this.content,
						publication_date: this.date,
						beginning: this.dateRange[0],
						end: this.dateRange[1] ?? this.dateRange[0],
					});

					const postImageUrl = '/api/post-images';
					if (this.isCreateImageRequest()) {
						const formData = new FormData();
						formData.append('path', this.imageFile);
						formData.append('alt', 'to jest alt');
						formData.append('post_id', postId);

						const imageResponse = await this.$axios.post(postImageUrl, formData);
						this.image = imageResponse.data;
						this.previewImagePath = imageResponse.data.path;
						this.$refs.fileInput.reset();
					} else if (this.isUpdateImageRequest()) {
						const formData = new FormData();
						formData.append('path', this.imageFile);
						formData.append('alt', 'to jest alt');
						formData.append('_method', 'PATCH');

						const imageResponse = await this.$axios.post(`${postImageUrl}/${this.image.id}`, formData);
						this.image = imageResponse.data;
						this.previewImagePath = imageResponse.data.path;
						this.$refs.fileInput.reset();
					} else if (this.isDeleteImageRequest()) {
						await this.$axios.delete(`${postImageUrl}/${this.image.id}`);
						this.isDelete = false;
						this.previewImagePath = null;
						this.image = null;
						this.componentToUpdateKey += 1;
					}

					this.$axios.setToken('', 'Bearer', ['post', 'put', 'delete']);
				}
			},
			hasImage () {
				return this.previewImagePath !== null;
			},
			onUpload (file) {
				if (file !== undefined) {
					this.previewImagePath = URL.createObjectURL(file);
					this.imageFile = file;
				}
			},
			isCreateImageRequest () {
				return this.image === null && this.previewImagePath !== null;
			},
			isUpdateImageRequest () {
				return this.image !== null
				&& this.previewImagePath !== null
				&& this.image.path !== this.previewImagePath;
			},
			isDeleteImageRequest () {
				return this.isDelete;
			},
			setPreviousImage () {
				if (this.image !== null) {
					this.previewImagePath = this.image.path;
				} else {
					this.previewImagePath = null;
				}
			},
			isDeletable () {
				return this.image !== null && this.image.path === this.previewImagePath;
			}
		},
    }
</script>

<style lang="scss" scoped>
	@import "~/assets/posts-overall.scss";
</style>
