export const colors = {
  primary: {
    value: "#6EC800",
    hover: { value: "#63B400" },
    contrast: { value: "white" },
  },
  fg: {
    value: "colors.gray.600",
    muted: { value: "{colors.gray.500}" },
    subtle: { value: "{colors.gray.400}" },
  },
  bg: {
    light: { value: "{colors.white}" },
    medium: { value: "{colors.gray.50}" },
    dark: { value: "{colors.gray.100}" },
    darker: { value: "{colors.gray.200}" },
  },
};

export const semanticColors = {
  primary: colors.primary,
  "primary.hover": colors.primary.hover,
  "primary.contrast": colors.primary.contrast,
  fg: colors.fg,
};
