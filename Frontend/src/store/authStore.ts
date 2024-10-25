import { makeAutoObservable, runInAction } from 'mobx';
import { User } from '../config/models/User';
import { authApis } from '../config/apiRoutes/authApi';

class AuthStore {
    loading: boolean = false;
    user: User | null = null;
    token: string | null = null;
    isAuthenticated: boolean = false;


    setUser = (user: User) => this.user = user
    setLoading = (load: boolean) => this.loading = load

    constructor() {
        makeAutoObservable(this);
        this.token = localStorage.getItem('token');
        this.isAuthenticated = !!this.token;
        this.getCurrentUser()
    }

    setToken(token: string | null) {
        this.token = token;
        this.isAuthenticated = !!token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    login = async (username: string, password: string) => {
        try {
            const response = await authApis.postLogin({ email: username, password });

            runInAction(() => {
                this.setUser(response.data.user);
                this.setToken(response.data.token);
            });
            console.log("here,", response)
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    getCurrentUser = async () => {
        try {
            this.setLoading(true)
            const localtoken = localStorage.getItem('token');
            if (!localtoken || this.user) {
                return;
            }
            const response = await authApis.getCurrentUser();
            runInAction(() => {
                this.setUser(response.data);
            });
        } catch (error) {
            console.error('Failed to get current user:', error);
            // this.logout();
            window.location.reload()
        } finally {
            this.setLoading(false)
        }
    }

    logout = async () => {
        try {
            this.setLoading(true)
            await authApis.postLogout();
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            runInAction(() => {
                this.user = null;
                this.setToken(null);
                this.isAuthenticated = false;
            });
            localStorage.clear()
            this.setLoading(false)
        }
    }

}

export const authStore = new AuthStore();