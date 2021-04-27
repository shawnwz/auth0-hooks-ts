import React, {useState, useEffect} from 'react'
import createAuth0Client, {Auth0ClientOptions} from '@auth0/auth0-spa-js'
import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client'
import {RedirectLoginOptions, GetIdTokenClaimsOptions, GetTokenSilentlyOptions, LogoutOptions, IdToken } from '@auth0/auth0-react'
import {User} from "@auth0/auth0-react/dist/auth-state";

interface ContextValueType {
    isAuthenticated: boolean
    user?: User
    isLoading: boolean
    getIdTokenClaims(o?: GetIdTokenClaimsOptions): Promise<IdToken>
    loginWithRedirect(o?: RedirectLoginOptions): Promise<void>
    getTokenSilently(o?: GetTokenSilentlyOptions): Promise<string | undefined>
    logout(o?: LogoutOptions): void
}

interface Auth0ProviderOptions {
    children: React.ReactElement
}

function createContext<ContextValueType>() {
    const Auth0Context = React.createContext<ContextValueType | null>(null);
    function useAuth0() {
        const context = React.useContext(Auth0Context)
        if(!context){
            throw new Error("xxx");
        }
        return context;
    }
    return [Auth0Context, useAuth0] as const;
}

export const [Auth0Context, useAuth0] = createContext<ContextValueType>();

export const Auth0Provider = ({children}: Auth0ProviderOptions): JSX.Element => {

    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [user, setUser] = useState<User>()
    const [auth0Client, setAuth0Client] = useState<Auth0Client>()
    const [isLoading, setIsLoading] = useState(false)

    const auth0Config:Auth0ClientOptions = {
        domain: `${process.env.REACT_APP_AUTH0_DOMAIN}`,
        client_id: `${process.env.REACT_APP_AUTH0_CLIENT_ID}`,
        redirect_uri: window.location.origin
    }

    useEffect(() => {
        const initializeAuth0 = async () => {
            console.log('auth0-context is initializing auth0...')
            setIsLoading(true)
            const client = await createAuth0Client(auth0Config)
            setAuth0Client(client)

            const handleRedirectCallback = async () => {
                setIsLoading(true)
                await client.handleRedirectCallback()
                const userProfile = await client.getUser()
                setIsLoading(false)
                setIsAuthenticated(true)
                setUser(userProfile)
                window.history.replaceState({}, document.title, window.location.pathname);
            }

            if (window.location.search.includes('code=')) {
                return handleRedirectCallback();
            }

            const authed = await client.isAuthenticated()

            if (authed) {
                const userProfile = await client.getUser()

                setIsAuthenticated(true)
                setUser(userProfile)
            }

            setIsLoading(false)
        }

        initializeAuth0()

    }, [])

    const loginWithRedirect = (options?: RedirectLoginOptions) : Promise<void> => {
        if (auth0Client !== undefined) {
            return auth0Client.loginWithRedirect(options)
        } else {
            return Promise.reject(new Error('There is an error when logging in with redirect...'))
        }
    }

    const getTokenSilently = (options?: GetTokenSilentlyOptions):Promise<string | undefined> => {
        if (auth0Client !== undefined) {
            return auth0Client.getTokenSilently(options)
        } else {
            return Promise.reject(new Error('There is an error when getting token silently...'))
        }
    }

    const logout = (options?: LogoutOptions) => {
        if (auth0Client !== undefined) {
            auth0Client.logout(options)
        }
    }

    const getIdTokenClaims = (options?: GetIdTokenClaimsOptions):Promise<IdToken> => {
        if (auth0Client !== undefined) {
            return auth0Client.getIdTokenClaims(options)
        } else {
            return Promise.reject(new Error('There is an error when getting id token claims...'))
        }
    }

    return (
        <Auth0Context.Provider
            value={{
                isAuthenticated,
                user,
                isLoading,
                loginWithRedirect,
                logout,
                getTokenSilently,
                getIdTokenClaims
            }}
        >
            {children}
        </Auth0Context.Provider>
    );
};
