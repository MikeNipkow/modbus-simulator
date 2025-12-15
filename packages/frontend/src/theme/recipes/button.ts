import { defineRecipe } from "@chakra-ui/react";

export const buttonRecipe = defineRecipe({
  variants: {
    variant: {
      primary: {
        bg: "primary",
        color: "primary.contrast",
        _hover: {
          bg: "primary.hover",
        },
        _focus: {
          focusRingColor: "primary",
        },
      },
      secondary: {
        bg: "transparent",
        _hover: {
          color: "primary",
          bg: "blackAlpha.50",
        },
        _active: {
          color: "primary",
        },
      },
    },
  },
});
