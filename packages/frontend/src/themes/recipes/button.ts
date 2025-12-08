import { defineRecipe } from "@chakra-ui/react";

/**
 * Button-Rezept für konsistente Button-Styles
 */
export const buttonRecipe = defineRecipe({
  variants: {
    variant: {
      sidebar: {
        width: "100%",
        justifyContent: "flex-start",
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
