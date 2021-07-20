import React from 'react';
import ReactDOM from 'react-dom';
import {ApolloClient,createHttpLink,InMemoryCache,ApolloProvider,ApolloLink, from, Observable } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from "@apollo/client/link/error";
import { getAccessToken, setAccessToken } from './accessToken';
import App from './App';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import jwt_decode from 'jwt-decode';


// apollo cient setup
const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
  credentials: "include",
});

// const authLink = setContext((_, { headers }) => {
//   // get the authentication token from local storage if it exists
//   const accessToken = getAccessToken();
//   // console.log(accessToken);
//   // return the headers to the context so httpLink can read them
//   return {
//     headers: {
//       ...headers,
//       authorization: accessToken ? `${accessToken}` : "",
//     }
//   }
// });

const authMiddleware = new ApolloLink((operation, forward) => {
  // add the authorization to the headers
  const accessToken = getAccessToken();
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      authorization: accessToken ? `${accessToken}` : "",
    }
  }));

  return forward(operation);
});

const requestLink = new ApolloLink(
  (operation, forward) => {
  new Observable(observer => {
    let handle: any;
    Promise.resolve(operation)
    .then(() => {
      handle = forward(operation).subscribe({
        next: observer.next.bind(observer),
        error: observer.error.bind(observer),
        complete: observer.complete.bind(observer)
      });
    })
    .catch(observer.error.bind(observer));

    return ()=>{
      if (handle) handle.unsubscribe();
    }
  })

  return forward(operation);
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: from([
    new TokenRefreshLink({
      accessTokenField: "accessToken",
      isTokenValidOrUndefined: () => {
        const token = getAccessToken();

        if(!token){
          return true;
        }

        try {
          const { exp }:any = jwt_decode(token);
          if(Date.now() >= exp * 1000 ){
            return false
          }else {
            return true;
          }
        }catch {
          return false;
        }

      },
      fetchAccessToken: () => {
        return  fetch('http://localhost:4000/refresh_token', {
          method:"POST",
          credentials: 'include'
        });
      },
      handleFetch: accessToken => {
        setAccessToken(accessToken);
      },
      handleError: err => {
         console.warn('Your refresh token is invalid. Try to relogin');
         console.error(err);
      }
    }),
    onError(({graphQLErrors, networkError}) => {
        console.log(graphQLErrors);
        console.log(networkError);
    }),
    authMiddleware,
    requestLink,
    httpLink
  ])
});




ReactDOM.render(
  <React.StrictMode>
     <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

