import gql from "graphql-tag";

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    name: String
    image: String
    email: String
    emailVerified: Boolean
  }
  type SearchedUser {
    id: ID!
    username: String!
  }
  type CreateUsernameResponse {
    success: Boolean
    error: String
  }
  type Query {
    searchUsers(username: String): [SearchedUser]!
  }
  type Mutation {
    createUsername(username: String): CreateUsernameResponse
  }
`;

export default typeDefs;
