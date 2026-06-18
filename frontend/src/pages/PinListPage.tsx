import { useCallback, useEffect, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
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
import { FiEdit2, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import { deletePin, fetchPins } from "../api/pins";
import type { Pin } from "../types/pin";

/**
 * 徽章交换记录列表页
 */
export default function PinListPage() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toast = useToast();

  const loadPins = useCallback(async (keyword?: string) => {
    setLoading(true);
    try {
      const trimmed = keyword?.trim();
      const data = await fetchPins(trimmed || undefined);
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
  }, [toast]);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      loadPins(searchKeyword);
    }, 300);
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchKeyword, loadPins]);

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
      await loadPins(searchKeyword);
    } catch {
      toast({ title: "删除失败", status: "error", duration: 3000 });
    }
  };

  const hasActiveSearch = searchKeyword.trim().length > 0;

  const renderTableBody = () => {
    if (loading) {
      return (
        <Tbody>
          <Tr>
            <Td colSpan={6} py={12} textAlign="center">
              <Spinner size="lg" color="teal.500" />
            </Td>
          </Tr>
        </Tbody>
      );
    }
    if (pins.length === 0) {
      return (
        <Tbody>
          <Tr>
            <Td colSpan={6} py={12} textAlign="center">
              <Text color="gray.500">
                {hasActiveSearch
                  ? "未找到匹配记录"
                  : "暂无记录，点击「新增记录」添加第一条交换记录。"}
              </Text>
            </Td>
          </Tr>
        </Tbody>
      );
    }
    return (
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
    );
  };

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

      <Box mb={4} maxW="400px">
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="搜索图案描述或交换对象..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            bg="white"
          />
        </InputGroup>
      </Box>

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
          {renderTableBody()}
        </Table>
      </Box>
    </Box>
  );
}
