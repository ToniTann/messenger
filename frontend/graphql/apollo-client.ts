import { ApolloClient, InMemoryCache } from "@apollo/client";
import { split, HttpLink } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import App from "next/app";
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getSession } from "next-auth/react";
const httpLink = new HttpLink({
  uri: "http://localhost:8000",
  credentials: "include",
});
const wsLink = typeof window !== 'undefined' ? new GraphQLWsLink(createClient({
  url: 'ws://localhost:8000/graphql/subscriptions',
  connectionParams:async()=>({
    session: await getSession()
  })
})):null
const link =
  typeof window !== "undefined" && wsLink !== null
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === "OperationDefinition" &&
            definition.operation === "subscription"
          );
        },
        wsLink,
        httpLink
      )
    : httpLink;
export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  credentials:"include"
});
