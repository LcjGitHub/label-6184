import { Box, Container, Heading, Tab, TabList, Tabs } from "@chakra-ui/react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import ContactListPage from "./pages/ContactListPage";
import PinEditPage from "./pages/PinEditPage";
import PinListPage from "./pages/PinListPage";
import SeriesListPage from "./pages/SeriesListPage";
import WishEditPage from "./pages/WishEditPage";
import WishListPage from "./pages/WishListPage";

function AppTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  const isContacts = location.pathname.startsWith("/contacts");
  const isSeries = location.pathname.startsWith("/series");
  const isWishes = location.pathname.startsWith("/wishes");

  const handleTabChange = (index: number) => {
    if (index === 0) {
      navigate("/");
    } else if (index === 1) {
      navigate("/contacts");
    } else if (index === 2) {
      navigate("/series");
    } else {
      navigate("/wishes");
    }
  };

  let tabIndex = 0;
  if (isContacts) tabIndex = 1;
  if (isSeries) tabIndex = 2;
  if (isWishes) tabIndex = 3;

  return (
    <Tabs
      variant="enclosed-colored"
      colorScheme="teal"
      index={tabIndex}
      onChange={handleTabChange}
      mb={6}
    >
      <TabList>
        <Tab>徽章交换记录</Tab>
        <Tab>交换对象通讯录</Tab>
        <Tab>徽章系列分类</Tab>
        <Tab>愿望清单</Tab>
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
          <Route
            path="/series"
            element={
              <>
                <AppTabs />
                <SeriesListPage />
              </>
            }
          />
          <Route
            path="/wishes"
            element={
              <>
                <AppTabs />
                <WishListPage />
              </>
            }
          />
          <Route path="/wishes/new" element={
            <>
              <AppTabs />
              <WishEditPage />
            </>
          } />
          <Route path="/wishes/:id/edit" element={
            <>
              <AppTabs />
              <WishEditPage />
            </>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </Box>
  );
}
