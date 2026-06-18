import { Box, Container, Heading, Tab, TabList, Tabs } from "@chakra-ui/react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import ContactListPage from "./pages/ContactListPage";
import PinEditPage from "./pages/PinEditPage";
import PinListPage from "./pages/PinListPage";

function AppTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  const isContacts = location.pathname.startsWith("/contacts");

  const handleTabChange = (index: number) => {
    if (index === 0) {
      navigate("/");
    } else {
      navigate("/contacts");
    }
  };

  return (
    <Tabs
      variant="enclosed-colored"
      colorScheme="teal"
      index={isContacts ? 1 : 0}
      onChange={handleTabChange}
      mb={6}
    >
      <TabList>
        <Tab>徽章交换记录</Tab>
        <Tab>交换对象通讯录</Tab>
      </TabList>
    </Tabs>
  );
}

/**
 * 应用根组件，包含布局与路由
 */
export default function App() {
  return (
    <Box minH="100vh" py={8}>
      <Container maxW="container.xl">
        <Heading as="h1" size="lg" mb={4} color="teal.700">
          金属徽章 Pin 交换管理
        </Heading>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <AppTabs />
                <PinListPage />
              </>
            }
          />
          <Route path="/pins/new" element={
            <>
              <AppTabs />
              <PinEditPage />
            </>
          } />
          <Route path="/pins/:id/edit" element={
            <>
              <AppTabs />
              <PinEditPage />
            </>
          } />
          <Route
            path="/contacts"
            element={
              <>
                <AppTabs />
                <ContactListPage />
              </>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </Box>
  );
}
