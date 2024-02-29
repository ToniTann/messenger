import React from "react";
import { MessagePopulated } from "../../../../../../backend/src/util/types";
import { Avatar, Box, Flex, Stack, Text } from "@chakra-ui/react";
import { formatRelative } from "date-fns";
import { enUS } from "date-fns/locale/en-US";

const formatRelativeLocale = {
  lastWeek: "eeee 'at' p",
  yesterday: "'Yesterday at' p",
  today: "p",
  other: "MM/dd/yy",
};

const locale = {
  ...enUS,
  formatRelative: (token: any) => formatRelativeLocale[token],
};

type MessageItemProps = {
  message: MessagePopulated;
  sentByMe: boolean;
};

const MessageItem = ({ message, sentByMe }: MessageItemProps) => {
  const date = formatRelative(message.createdAt, new Date(), { locale });
  return (
    <Stack
      direction={"row"}
      p={4}
      spacing={4}
      _hover={{ bg: "whiteAlpha.200" }}
      wordBreak={"break-word"}
      align={"center"}
      justify={sentByMe ? "flex-end" : "flex-start"}
    >
      {!sentByMe && (
        <Flex align={"center"}>
          <Avatar size={"sm"} />
        </Flex>
      )}
      <Stack spacing={1} width={"100%"}>
        <Stack
          direction={"row"}
          align={"center"}
          justify={sentByMe ? "flex-end" : "flex-start"}
        >
          {!sentByMe && (
            <Text fontWeight={500} textAlign={"left"}>
              {message.sender.username}
            </Text>
          )}
          <Text fontSize={14} color={"whiteAlpha.700"}>
            {date}
          </Text>
        </Stack>
        <Flex justify={sentByMe ? "flex-end" : "flex-start"}>
          <Box
            bg={sentByMe ? "brand.100" : "whiteAlpha.300"}
            px={2}
            py={1}
            borderRadius={12}
            maxWidth={"65%"}
          >
            <Text>{message.body}</Text>
          </Box>
        </Flex>
      </Stack>
    </Stack>
  );
};

export default MessageItem;
