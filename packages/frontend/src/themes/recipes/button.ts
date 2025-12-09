import { defineRecipe } from "@chakra-ui/react";

/**
 * Button-Rezept für konsistente Button-Styles
 */
export const buttonRecipe = defineRecipe({
  variants: {
    variant: {
      primary: {
        bg: "brand",
        color: "white",
        _hover: {
          bg: "brandDark",
        },
      },
      sidebar: {
        width: "100%",
        justifyContent: "flex-start",
        padding: "12px",
        border: "none",
        borderRadius: "0",
        color: "gray.600",
        _hover: {
          color: "brand",
        },
      },
    },
  },
});
