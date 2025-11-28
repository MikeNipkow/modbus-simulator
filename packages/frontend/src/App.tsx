import { Box, Grid, GridItem } from "@chakra-ui/react"
import NavBar from "./components/NavBar"

function App() {
  return (
    <Grid
      minH="100vh"
      templateRows="80px 1fr"
      templateColumns="250px 1fr"
      gap={0}
    >
      <GridItem colSpan={2} 
        borderBottom="2px solid" borderColor="brand" 
        boxShadow="0 4px 8px -2px rgba(0, 0, 0, 0.2)">
        <NavBar />
      </GridItem>
      <GridItem borderRight="2px solid" borderColor="brand">
        Sidebar
      </GridItem>
      <GridItem>
        Main
      </GridItem>
    </Grid>
  )
}

export default App
