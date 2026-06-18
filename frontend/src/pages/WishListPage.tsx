import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { FiEdit2, FiPlus, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import { deleteWish, fetchWishes } from "../api/wishes";
import type { Wish } from "../types/wish";

const priorityColorMap: Record<string, string> = {
  高: "red",
  中: "yellow",
  低: "gray",
};

/**
 * 愿望清单列表页
 */
export default function WishListPage() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const toast = useToast();

  const loadWishes = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchWishes();
      setWishes(data);
    } catch {
      setError(true);
      toast({
        title: "加载失败",
        description: "请确认后端服务已在 6000 端口启动",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishes();
  }, [loadWishes]);

  /**
   * 删除指定愿望并刷新列表
   */
  const handleDelete = async (wish: Wish) => {
    if (!window.confirm(`确定删除「${wish.pattern_description}」？`)) {
      return;
    }
    try {
      await deleteWish(wish.id);
      toast({ title: "已删除", status: "success", duration: 2000 });
      await loadWishes();
    } catch {
      toast({ title: "删除失败", status: "error", duration: 3000 });
    }
  };

  if (loading) {
    return (
      <Flex justify="center" py={12}>
        <Spinner size="lg" color="teal.500" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Box>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading as="h2" size="md">
            愿望清单列表
          </Heading>
          <Button
            leftIcon={<FiRefreshCw />}
            colorScheme="teal"
            onClick={loadWishes}
          >
            重新加载
          </Button>
        </Flex>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>加载失败</AlertTitle>
            <AlertDescription>
              无法连接到后端服务，请确认后端服务已在 6000 端口启动后点击「重新加载」。
            </AlertDescription>
          </Box>
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading as="h2" size="md">
          愿望清单列表
        </Heading>
        <Button
          as={RouterLink}
          to="/wishes/new"
          leftIcon={<FiPlus />}
          colorScheme="teal"
        >
          新增愿望
        </Button>
      </Flex>

      {wishes.length === 0 ? (
        <Text color="gray.500" py={8} textAlign="center">
          暂无愿望，点击「新增愿望」添加第一条愿望。
        </Text>
      ) : (
        <Box overflowX="auto" bg="white" borderRadius="md" shadow="sm">
          <Table size="md">
            <Thead bg="gray.100">
              <Tr>
                <Th>图案描述</Th>
                <Th>期望来源</Th>
                <Th>优先级</Th>
                <Th>已达成</Th>
                <Th textAlign="right">操作</Th>
              </Tr>
            </Thead>
            <Tbody>
              {wishes.map((wish) => (
                <Tr key={wish.id} _hover={{ bg: "gray.50" }}>
                  <Td fontWeight="medium">{wish.pattern_description}</Td>
                  <Td>{wish.expected_source}</Td>
                  <Td>
                    <Badge colorScheme={priorityColorMap[wish.priority] || "gray"}>
                      {wish.priority}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={wish.achieved ? "green" : "gray"}>
                      {wish.achieved ? "是" : "否"}
                    </Badge>
                  </Td>
                  <Td textAlign="right">
                    <IconButton
                      as={RouterLink}
                      to={`/wishes/${wish.id}/edit`}
                      aria-label="编辑"
                      icon={<FiEdit2 />}
                      size="sm"
                      variant="ghost"
                      colorScheme="teal"
                    />
                    <IconButton
                      aria-label="删除"
                      icon={<FiTrash2 />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      ml={1}
                      onClick={() => handleDelete(wish)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
}
