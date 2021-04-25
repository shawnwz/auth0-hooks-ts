import React, { useState, useEffect, useContext } from 'react'
import createAuth0Client, {Auth0ClientOptions} from '@auth0/auth0-spa-js'
import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client'
import {RedirectLoginOptions, GetIdTokenClaimsOptions, GetTokenSilentlyOptions, GetTokenWithPopupOptions, LogoutOptions, IdToken } from '@auth0/auth0-react'
import RedirectLoginResult from '@auth0/auth0-spa-js'
export interface Auth0RedirectState {
  targetUrl?: string
}

export interface Auth0User extends Omit<IdToken, '__raw'> {}

interface ContextValueType {
  isAuthenticated: boolean
  user?: Auth0User
  isLoading: boolean
  //handleRedirectCallback(): Promise<void>
  getIdTokenClaims(o?: GetIdTokenClaimsOptions): Promise<IdToken>
  loginWithRedirect(o?: RedirectLoginOptions): Promise<void>
  getTokenSilently(o?: GetTokenSilentlyOptions): Promise<string | undefined>
  logout(o?: LogoutOptions): void
}
interface Auth0ProviderOptions {
  children: React.ReactElement
  //onRedirectCallback(result: RedirectLoginResult): void
}

export const Auth0Context = React.createContext<ContextValueType | null>(null)
export const useAuth0 = () => useContext(Auth0Context)!
export const Auth0Provider = ({
  children
}: Auth0ProviderOptions) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<Auth0User>()
  const [auth0Client, setAuth0Client] = useState<Auth0Client>()
  const [isLoading, setIsLoading] = useState(false)

  let auth0Config:Auth0ClientOptions = {
       domain: `${process.env.REACT_APP_AUTH0_DOMAIN}`,
       client_id: `${process.env.REACT_APP_AUTH0_CLIENT_ID}`,
       redirect_uri: window.location.origin
  }

  useEffect(() => {
    const initializeAuth0 = async () => {
      console.log('auth0-context is initializing auth0...')
      const client = await createAuth0Client(auth0Config)
      setAuth0Client(client)

      const handleRedirectCallback = async () => {
        setIsLoading(true)
        const result = await client!.handleRedirectCallback()
        const userProfile = await client!.getUser()
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




  const loginWithRedirect = (options?: RedirectLoginOptions) =>
    auth0Client!.loginWithRedirect(options)

  const getTokenSilently = (options?: GetTokenSilentlyOptions) =>
    auth0Client!.getTokenSilently(options)

  const logout = (options?: LogoutOptions) =>
    auth0Client!.logout(options)

  const getIdTokenClaims = (options?: GetIdTokenClaimsOptions) =>
    auth0Client!.getIdTokenClaims(options)



  return (
    <Auth0Context.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        loginWithRedirect,
        logout,
        getTokenSilently,
        //handleRedirectCallback,
        getIdTokenClaims,

      }}
    >
      {children}
    </Auth0Context.Provider>
  );
};
