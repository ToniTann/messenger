import express from "express";
import { createServer } from "http";
import { PubSub } from "graphql-subscriptions";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import bodyParser from "body-parser";
import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import { connectDB } from "../config/db";
import { getSession } from "next-auth/react";
import { getServerSession } from "./utils/getServerSession";
import cookieParser from "cookie-parser";
import { GraphQLContext, SubscriptionContext } from "./util/types";
import { PrismaClient } from "@prisma/client";
require("dotenv").config();
(async function () {
  const app = express();

  const httpServer = createServer(app);
  const pubsub = new PubSub();
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql/subscriptions",
  });
  const prisma = new PrismaClient();
  const serverConfig = useServer(
    {
      schema,
      context: async (
        ctx: SubscriptionContext,
        msg,
        args
      ): Promise<GraphQLContext> => {
        if (ctx.connectionParams && ctx.connectionParams.session) {
          const { session } = ctx.connectionParams;
          return { session, prisma, pubsub };
        }
        return { session:ctx?.connectionParams?.session, prisma, pubsub };
      },
    },
    wsServer
  );

  const server = new ApolloServer({
    schema,
    csrfPrevention: true,
    // cache: "bounded",

    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // ApolloServerPluginLandingPageLocalDefault({
      //   embed: true,
      //   includeCookies: true,
      // }),

      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverConfig.dispose();
            },
          };
        },
      },
    ],
  });
  await server.start();
  var corsOptions = {
    origin: "http://localhost:3000",
    credentials: true, // <-- REQUIRED backend setting
  };

  app.use(cors(corsOptions));
  app.use(
    cookieParser(),

    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req }): Promise<GraphQLContext> => {
        const session = await getServerSession(req.headers.cookie!);
        return { session, pubsub, prisma };
      },
    })
  );
  connectDB();

  // httpServer.listen(8000, () => {
  //   console.log("Server running on http://localhost:" + "8000");
  // });
  await new Promise<void>((resolve)=>httpServer.listen({port:8000} ,  resolve))
  console.log("Server running on http://localhost:" + "8000");
})();
