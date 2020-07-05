export default function (context) {
	console.log('[Middleware] Check Auth');

	if(process.client) {
		context.store.dispatch('auth/initAuth', null);
	} else {
		context.store.dispatch('auth/initAuth', context.req);
	}
}
