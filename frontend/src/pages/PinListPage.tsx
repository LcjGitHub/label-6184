import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
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
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { deletePin, fetchPins } from "../api/pins";
import type { Pin } from "../types/pin";

/**
 * 徽章交换记录列表页
 */
export default function PinListPage() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const loadPins = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPins();
      setPins(data);
    } catch {
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
    loadPins();
  }, [loadPins]);

  /**
   * 删除指定记录并刷新列表
   */
  const handleDelete = async (pin: Pin) => {
    if (!window.confirm(`确定删除「${pin.pattern_description}」？`)) {
      return;
    }
    try {
      await deletePin(pin.id);
      toast({ title: "已删除", status: "success", duration: 2000 });
      await loadPins();
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

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading as="h2" size="md">
          交换记录列表
        </Heading>
        <Button
          as={RouterLink}
          to="/pins/new"
          leftIcon={<FiPlus />}
          colorScheme="teal"
        >
          新增记录
        </Button>
      </Flex>

      {pins.length === 0 ? (
        <Text color="gray.500" py={8} textAlign="center">
          暂无记录，点击「新增记录」添加第一条交换记录。
        </Text>
      ) : (
        <Box overflowX="auto" bg="white" borderRadius="md" shadow="sm">
          <Table size="md">
            <Thead bg="gray.100">
              <Tr>
                <Th>图案描述</Th>
                <Th>来源</Th>
                <Th>交换对象</Th>
                <Th>日期</Th>
                <Th>佩戴过</Th>
                <Th textAlign="right">操作</Th>
              </Tr>
            </Thead>
            <Tbody>
              {pins.map((pin) => (
                <Tr key={pin.id} _hover={{ bg: "gray.50" }}>
                  <Td fontWeight="medium">{pin.pattern_description}</Td>
                  <Td>{pin.source}</Td>
                  <Td>{pin.exchange_partner}</Td>
                  <Td>{pin.exchange_date}</Td>
                  <Td>
                    <Badge colorScheme={pin.worn ? "green" : "gray"}>
                      {pin.worn ? "是" : "否"}
                    </Badge>
                  </Td>
                  <Td textAlign="right">
                    <IconButton
                      as={RouterLink}
                      to={`/pins/${pin.id}/edit`}
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
                      onClick={() => handleDelete(pin)}
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
