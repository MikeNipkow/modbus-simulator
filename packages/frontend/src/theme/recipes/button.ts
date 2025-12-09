import { defineRecipe } from "@chakra-ui/react";

/**
 * Button-Rezept für konsistente Button-Styles
 */
export const buttonRecipe = defineRecipe({
  base: {
    fontWeight: "medium",
    borderRadius: "md",
  },
  variants: {
    variant: {
      primary: {
        bg: "primary",
        color: "primary.contrast",
        _hover: {
          bg: "primary.hover",
        },
      },
      secondary: {
        bg: "transparent",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "blackAlpha.300",
        _hover: {
          bg: "blackAlpha.50",
        },
      },
    },
  },
});
