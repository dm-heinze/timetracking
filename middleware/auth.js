// middleware: execute on inital call serverside and
// executes everytime a route changes on clientside
import _ from 'lodash';

export default function ({app, store, route, error, redirect}) {

    return new Promise((resolve, reject) => {

        let loginRoute = '/customer/login';

        // if user obj in store is not set
        // redirect to login form

        let hasSessionKey = false;
        if (!_.isEmpty(store.state.moduleUser.sessionObject) && !_.isEmpty(store.state.moduleUser.currentUser)) {
            if (store.state.moduleUser.sessionObject.value !== '') hasSessionKey = true;
        }

        if(!hasSessionKey) {
            resolve('current user is authorized');

            if (route.path === loginRoute) return;

            return redirect(loginRoute);
        }

        resolve();
    });
}
