import { useCallback, useEffect, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
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
import { FiEdit2, FiPlus, FiSearch, FiTrash2, FiChevronUp, FiChevronDown, FiStar } from "react-icons/fi";
import { deletePin, fetchPins, updatePin } from "../api/pins";
import type { Pin, PinSortField, SortOrder } from "../types/pin";

/**
 * 徽章交换记录列表页
 */
export default function PinListPage() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortBy, setSortBy] = useState<PinSortField>("exchange_date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [favoriteLoadingIds, setFavoriteLoadingIds] = useState<Set<number>>(new Set());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toast = useToast();

  const loadPins = useCallback(
    async (keyword?: string, sortField?: PinSortField, sortDir?: SortOrder) => {
      setLoading(true);
      try {
        const trimmed = keyword?.trim();
        const data = await fetchPins({
          keyword: trimmed || undefined,
          sortBy: sortField,
          sortOrder: sortDir,
        });
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
    },
    [toast]
  );

  useEffect(() => {
    loadPins(searchKeyword, sortBy, sortOrder);
  }, []);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      loadPins(searchKeyword, sortBy, sortOrder);
    }, 300);
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchKeyword]);

  const handleSort = (field: PinSortField) => {
    let newSortBy: PinSortField = field;
    let newSortOrder: SortOrder = "asc";
    if (sortBy === field) {
      newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    }
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    loadPins(searchKeyword, newSortBy, newSortOrder);
  };

  const renderSortIcon = (field: PinSortField) => {
    if (sortBy !== field) {
      return (
        <Flex direction="column" lineHeight={0.7} fontSize="10px">
          <FiChevronUp />
          <FiChevronDown />
        </Flex>
      );
    }
    return sortOrder === "asc" ? <FiChevronUp color="teal.500" /> : <FiChevronDown color="teal.500" />;
  };

  /**
   * 切换徽章的收藏状态
   */
  const handleToggleFavorite = async (pin: Pin) => {
    if (favoriteLoadingIds.has(pin.id)) {
      return;
    }
    try {
      setFavoriteLoadingIds((prev) => new Set(prev).add(pin.id));
      const newFavorite = !pin.is_favorite;
      const updatedPin = await updatePin(pin.id, {
        pattern_description: pin.pattern_description,
        source: pin.source,
        exchange_partner: pin.exchange_partner,
        exchange_date: pin.exchange_date,
        worn: pin.worn,
        is_favorite: newFavorite,
        tags: pin.tags,
      });
      setPins((prev) =>
        prev.map((p) => (p.id === pin.id ? updatedPin : p))
      );
      toast({
        title: newFavorite ? "已收藏" : "已取消收藏",
        status: "success",
        duration: 2000,
      });
    } catch {
      toast({ title: "操作失败", status: "error", duration: 3000 });
    } finally {
      setFavoriteLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(pin.id);
        return next;
      });
    }
  };

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
      await loadPins(searchKeyword, sortBy, sortOrder);
    } catch {
      toast({ title: "删除失败", status: "error", duration: 3000 });
    }
  };

  const hasActiveSearch = searchKeyword.trim().length > 0;

  const renderTagBadges = (tagsStr: string) => {
    const tags = tagsStr
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    if (tags.length === 0) {
      return <Text color="gray.400" fontSize="sm">—</Text>;
    }
    return (
      <HStack spacing={1} flexWrap="wrap">
        {tags.map((tag, idx) => (
          <Badge key={idx} colorScheme="teal" variant="subtle" fontSize="xs" px={2} py={0.5}>
            {tag}
          </Badge>
        ))}
      </HStack>
    );
  };

  const renderTableBody = () => {
    if (loading) {
      return (
        <Tbody>
          <Tr>
            <Td colSpan={8} py={12} textAlign="center">
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
            <Td colSpan={8} py={12} textAlign="center">
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
            <Td width="40px" textAlign="center">
              <IconButton
                aria-label={pin.is_favorite ? "取消收藏" : "收藏"}
                icon={<FiStar />}
                size="sm"
                variant="ghost"
                color={pin.is_favorite ? "yellow.500" : "gray.400"}
                onClick={() => handleToggleFavorite(pin)}
                fill={pin.is_favorite ? "currentColor" : "none"}
                isLoading={favoriteLoadingIds.has(pin.id)}
                isDisabled={favoriteLoadingIds.has(pin.id)}
              />
            </Td>
            <Td fontWeight="medium">
              <Link
                as={RouterLink}
                to={`/pins/${pin.id}`}
                color="teal.500"
                textDecoration="none"
                _hover={{ textDecoration: "underline" }}
              >
                {pin.pattern_description}
              </Link>
            </Td>
            <Td>{pin.source}</Td>
            <Td>{pin.exchange_partner}</Td>
            <Td>{pin.exchange_date}</Td>
            <Td>
              <Badge colorScheme={pin.worn ? "green" : "gray"}>
                {pin.worn ? "是" : "否"}
              </Badge>
            </Td>
            <Td>{renderTagBadges(pin.tags)}</Td>
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
            placeholder="搜索图案描述、交换对象或标签..."
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
              <Th width="40px" textAlign="center">收藏</Th>
              <Th>图案描述</Th>
              <Th
                cursor="pointer"
                userSelect="none"
                onClick={() => handleSort("source")}
                _hover={{ bg: "gray.200" }}
              >
                <Flex align="center" gap={1}>
                  来源
                  <Box as="span" display="inline-flex">
                    {renderSortIcon("source")}
                  </Box>
                </Flex>
              </Th>
              <Th>交换对象</Th>
              <Th
                cursor="pointer"
                userSelect="none"
                onClick={() => handleSort("exchange_date")}
                _hover={{ bg: "gray.200" }}
              >
                <Flex align="center" gap={1}>
                  日期
                  <Box as="span" display="inline-flex">
                    {renderSortIcon("exchange_date")}
                  </Box>
                </Flex>
              </Th>
              <Th>佩戴过</Th>
              <Th>标签</Th>
              <Th textAlign="right">操作</Th>
            </Tr>
          </Thead>
          {renderTableBody()}
        </Table>
      </Box>
    </Box>
  );
}
