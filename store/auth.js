import Cookie from 'js-cookie';

export const state = () => ({
	token: '',
	user: {}
});

export const mutations = {
	setToken(state, token) {
		state.token = token;
	},
	clearToken(state) {
		state.token = '';
	},
	setUser(state, user) {
		state.user = user;
	},
	clearUser(state) {
		state.user = {}
	}
};

export const actions = {
	async authenticateUser(vuexContext, authData) {
		try {
			const data = await this.$axios.$post('/oauth/token', {
				grant_type: 'password',
				client_id: process.env.clientId,
				client_secret: process.env.clientSecret,
				username: authData.email,
				password: authData.password,
			});

			const token = data.access_token;
			const expirationDate = new Date().getTime() + 10000 * 60 * 15

			vuexContext.commit('setToken', token);
			localStorage.setItem('token', token);
			localStorage.setItem('tokenExpiration', expirationDate);

			Cookie.set('jwt', token);
			Cookie.set('expirationDate', expirationDate);

			this.$axios.setToken(token, 'Bearer', ['get']);
			const user = await this.$axios.$get('/api/users/me');
			this.$axios.setToken('', 'Bearer', ['get']);

			localStorage.setItem('user', JSON.stringify(user));
			Cookie.set('user', user);

			vuexContext.commit('setUser', user);

			return 200;
		} catch (error) {
			return error.response.status;
		}
	},
	initAuth(vuexContext, req) {
		let token;
		let expirationDate;
		let user;

		if (req) {
			if (!req.headers.cookie) {
				return;
			}

			const jwtCookie = req.headers.cookie
				.split(';')
				.find(c => c.trim().startsWith('jwt='))
			;

			if (!jwtCookie) {
				return;
			}

			token = jwtCookie.split('=')[1];

			expirationDate = req.headers.cookie
				.split(';')
				.find(c => c.trim().startsWith('expirationDate='))
				.split('=')[1]
			;

			const userCookie = req.headers.cookie
				.split(';')
				.find(c => c.trim().startsWith('user='))
				.split('=')[1]
			;

			user = JSON.parse(decodeURIComponent(userCookie));
		} else {
			token = localStorage.getItem('token');
			expirationDate = Number.parseInt(localStorage.getItem('tokenExpiration'));
			user = JSON.parse(localStorage.getItem('user'))
		}

		if (new Date().getTime() > +expirationDate || !token) {
			vuexContext.dispatch('logout');
			return;
		}

		vuexContext.commit('setToken', token);
		vuexContext.commit('setUser', user);
	},
	logout(vuexContext) {
		vuexContext.commit('clearToken');
		vuexContext.commit('clearUser');

		Cookie.remove('jwt');
		Cookie.remove('expirationDate');

		if(process.client) {
			localStorage.removeItem('token');
			localStorage.removeItem('tokenExpiration');
		}
	},
	async registration (vuexContext, authData) {
		try {
			await this.$axios.$post('/api/register', {
				name: authData.name,
				email: authData.email,
				password: authData.password,
				password_confirmation: authData.password_confirmation
			});

			return 200;
		} catch (error) {
			return error.response.status;
		}
	}
};

export const getters = {
	isAuthenticated: state => {
		return state.token !== '';
	}
}
