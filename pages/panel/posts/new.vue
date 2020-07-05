<template>
    <div class="panel-background form-wrapper">
		<v-form
			ref="form"
			v-model="valid"
			lazy-validation
			class="col-12"
		>
			<h1 class="title">Nowy post</h1>

			<v-text-field
				v-model="title"
				:rules="titleRules"
				label="Tytuł"
				required
				placeholder=" "
				prepend-icon="mdi-format-title"
			/>

			<v-textarea
				:rules="contentRules"
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
						:rules="publicationDateRules"
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
						:rules="dateRangeRules"
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
			contentRules: [
				v => !!v || 'Treść jest wymagana',
			],
			publicationDateRules: [
				v => !!v || 'Data jest wymagana',
			],
			dateRangeRules: [
				v => !!v || 'Przedział czasu jest wymagany',
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
			componentToUpdateKey: 1
		}),

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

					const post = await this.$axios.post(`/api/posts`, {
						title: this.title,
						content: this.content,
						publication_date: this.date,
						beginning: this.dateRange[0] ?? null,
						end: this.dateRange[1] ?? this.dateRange[0],
					});

					const postId = post.data.id;

					if (this.previewImagePath !== null) {
						const formData = new FormData();
						formData.append('path', this.imageFile);
						formData.append('alt', 'to jest alt');
						formData.append('post_id', postId);

						await this.$axios.post('/api/post-images', formData);
					}

					await this.$axios.setToken('', 'Bearer', ['post', 'put', 'delete']);

					await this.$router.push(`/panel/posts/${postId}`);
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
			setPreviousImage () {
				if (this.image !== null) {
					this.previewImagePath = this.image.path;
				} else {
					this.previewImagePath = null;
				}
			},
		},
    }
</script>

<style lang="scss" scoped>
	@import "~/assets/posts-overall.scss";
</style>
