import { Box, Container, Heading } from "@chakra-ui/react";
import { Route, Routes } from "react-router-dom";
import PinEditPage from "./pages/PinEditPage";
import PinListPage from "./pages/PinListPage";

/**
 * 应用根组件，包含布局与路由
 */
export default function App() {
  return (
    <Box minH="100vh" py={8}>
      <Container maxW="container.xl">
        <Heading as="h1" size="lg" mb={6} color="teal.700">
          金属徽章 Pin 交换记录
        </Heading>
        <Routes>
          <Route path="/" element={<PinListPage />} />
          <Route path="/pins/new" element={<PinEditPage />} />
          <Route path="/pins/:id/edit" element={<PinEditPage />} />
        </Routes>
      </Container>
    </Box>
  );
}
