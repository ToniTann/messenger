import type { NextPage, NextPageContext } from "next";

import { getSession, signIn, signOut, useSession } from "next-auth/react";
import { Box } from "@chakra-ui/react";
import Chat from "../components/Chat/Chat";
import Auth from "../components/Auth/Auth";
import { Toaster } from "react-hot-toast";
import { useMemo } from "react";
const Home: NextPage = () => {
  const { data: session } = useSession();
    const memoizedSession = useMemo(() => session, [session]);

  const reloadSession = () => {
    const event = new Event("visibilitychange");
    document.dispatchEvent(event);
  };
  console.log('Home render')
  return (
    <div>
      <Box>
        {session?.user.username ? (
          <Chat session={memoizedSession!} />
        ) : (
          <Auth session={memoizedSession} reloadSession={reloadSession} />
        )}
      </Box>
    </div>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  return {
    props: {
      session,
    },
  };
}

export default Home;
