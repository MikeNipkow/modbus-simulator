import { AbsoluteCenter, HStack, Image, Spacer, Text } from "@chakra-ui/react";

interface Props {
  onHomeClick?: () => void;
  title: string;
}

const Navbar = ({ title, onHomeClick }: Props) => {
  return (
    <HStack height={"100%"} margin={"0 20px"}>
      <Image
        src="/src/assets/logo.svg"
        alt="Logo"
        height="60%"
        onClick={onHomeClick}
      />
      <AbsoluteCenter axis={"horizontal"}>
        <Text>{title}</Text>
      </AbsoluteCenter>
      <Spacer />
      <Text>v1.0.0</Text>
    </HStack>
  );
};

export default Navbar;
