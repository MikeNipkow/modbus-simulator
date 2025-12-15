import { Button } from "@chakra-ui/react";
import { type ComponentProps } from "react";

interface Props extends ComponentProps<typeof Button> {}

const SidebarButton = (props: Props) => {
  return (
    <Button
      width="100%"
      borderRadius="0"
      justifyContent="flex-start"
      focusRing="none"
      {...props}
    />
  );
};

export default SidebarButton;
