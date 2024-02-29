import { GraphQLError } from "graphql";
import { CreateUsernameResponse, GraphQLContext } from "../util/types";
import { User } from "@prisma/client";

const resolvers = {
  Query: {
    searchUsers: async(
      parent: any,
      { username }: { username: string },
      { session, prisma }: GraphQLContext
    ):Promise<Array<User>> => {
      if (!session.user) {
        throw new GraphQLError("Not Authorized")
      }
      const {user:{username:myUsername}} = session
      try {
        const users = await prisma.user.findMany({
          where:{
            username:{
              contains:username,
              not:myUsername,
              mode:'insensitive'
            }
          }
        })
        return users
      } catch (error:any) {
        console.log(error)
        throw new GraphQLError(error.message)
      }
    },
  },
  Mutation: {
    createUsername: async (
      parent: any,
      { username }: { username: string },
      { session, prisma }: GraphQLContext
    ): Promise<CreateUsernameResponse> =>
      //
      {
        if (!session.user) {
          return {
            error: "Not Authorized",
          };
        }
        const { id: userId } = session.user;
        console.log(session);
        console.log(userId);

        try {
          const existingUser = await prisma.user.findUnique({
            where: { username },
          });
          // console.log(existingUser)
          if (existingUser) {
            return {
              error: "Username is taken",
            };
          }
          await prisma.user.update({
            where: {
              id: userId,
            },
            data: {
              username,
            },
          });
          return { success: true };
        } catch (error: any) {
          console.log(error);
          return {
            error: error.message,
          };
        }
      },
  },
};
export default resolvers;
