import { Grid, GridItem } from "@chakra-ui/react"
import NavBar from "./components/NavBar"
import { Test } from "./components/Test"
import SideBar from "./components/sidebar/SideBar"

function App() {

  return (
    <Grid
      minH="100vh"
      templateRows="80px 1fr"
      templateColumns="300px 1fr"
      gap={0}
    >
      {/* Navbar */}
      <GridItem colSpan={2} 
        borderBottom="2px solid" borderColor="brand" 
        boxShadow="0 4px 8px -2px rgba(0, 0, 0, 0.2)">
        <NavBar />
      </GridItem>

      {/* Sidebar */}
      <GridItem borderRight="2px solid" borderColor="brand">
        <SideBar />
      </GridItem>

      {/* Main Content */}
      <GridItem>
        <Test />
      </GridItem>
    </Grid>
  )
}

export default App
