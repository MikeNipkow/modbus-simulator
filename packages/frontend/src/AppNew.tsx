import { Button, Grid, GridItem } from "@chakra-ui/react";

function AppNew() {
  return (
    <Grid h="100vh" templateRows="60px 1fr" templateColumns="300px 1fr" gap={0}>
      {/* Navbar */}
      <GridItem
        colSpan={2}
        background={"bg.light"}
        borderBottom={"1px solid"}
        borderColor={"primary"}
      ></GridItem>

      {/* Sidebar */}
      <GridItem
        background={"bg.medium"}
        borderRight={"1px solid"}
        borderColor={"primary"}
      ></GridItem>

      {/* Main Content */}
      <GridItem background={"bg.dark"}>
        <Button size={"2xl"} variant={"primary"}>
          Test
        </Button>
        <Button size={"2xl"} variant={"secondary"}>
          Test
        </Button>
      </GridItem>
    </Grid>
  );
}

export default AppNew;
