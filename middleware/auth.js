// middleware: execute on inital call serverside and
// executes everytime a route changes on clientside
import _ from 'lodash';

export default function ({ app, store, route, error, redirect }) {
        let loginRoute = '/customer/login';

        let hasSessionKey = false;

        if (!_.isEmpty(store.state.moduleUser.sessionObject)) {
            if (store.state.moduleUser.sessionObject.value !== '') hasSessionKey = true;
        }

        if(!hasSessionKey) {
            if (route.path === loginRoute) return;

            return redirect(loginRoute);
        } else {
            if (route.path === '/') return;

            if (route.path === loginRoute) redirect('/');
        }
}
