import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig(
    {
        theme: {
            tokens: {
                colors: {
                    brand: {
                        value: "#81A938"
                    }
                }
            },
            semanticTokens: {
                colors: {
                    brand: {
                        solid: { value: '{colors.brand}' }
                    }
                }
            }
        }
    }
);

const system = createSystem(defaultConfig, config);

export default system;