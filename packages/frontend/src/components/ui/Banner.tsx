import { useState, type ReactNode } from "react";
import { CloseButton, HStack, Alert, Icon, VStack } from "@chakra-ui/react";

interface BannerProps {
  status?: "info" | "warning" | "error" | "success" | "neutral";
  title?: string;
  children?: ReactNode;
  icon?: React.ElementType;
  onClose?: () => void;
}

const Banner = ({
  status = "info",
  title,
  children,
  icon,
  onClose,
}: BannerProps) => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <Alert.Root
      status={status}
      position="fixed"
      top="50px"
      left="50%"
      transform="translateX(-50%)"
      width="fit-content"
      minWidth="320px"
      maxWidth="25vw"
    >
      <HStack>
        {icon && <Icon as={icon} marginTop="4px" />}
        <VStack alignItems="flex-start">
          {title && <Alert.Title>{title}</Alert.Title>}
          {children && <Alert.Description>{children}</Alert.Description>}
        </VStack>
        <CloseButton
          onClick={() => {
            setVisible(false);
            onClose?.();
          }}
        />
      </HStack>
    </Alert.Root>
  );
};

export default Banner;
