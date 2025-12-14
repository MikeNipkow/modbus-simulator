import { HStack, Separator, Text } from "@chakra-ui/react";
import React from "react";

interface Props {
  label: string;
  hstackProps?: React.ComponentProps<typeof HStack>;
}

const LabeledSeparator = ({ label, hstackProps }: Props) => {
  return (
    <HStack padding={"24px 0 12px 0"} {...hstackProps}>
      <Separator flex="1" />
      <Text fontWeight={"semibold"} flexShrink="0">
        {label}
      </Text>
      <Separator flex="1" />
    </HStack>
  );
};

export default LabeledSeparator;
