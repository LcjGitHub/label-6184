import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Spinner,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { FiArrowLeft, FiEdit2 } from "react-icons/fi";
import { fetchPin } from "../api/pins";
import type { Pin } from "../types/pin";

function renderTagBadges(tagsStr: string) {
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
}

/**
 * 徽章交换记录详情页
 */
export default function PinDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [pin, setPin] = useState<Pin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPin(Number(id));
        if (!cancelled) {
          setPin(data);
        }
      } catch {
        if (!cancelled) {
          toast({
            title: "加载失败",
            description: "记录不存在或后端未启动",
            status: "error",
            duration: 4000,
          });
          navigate("/");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <Flex justify="center" py={12}>
        <Spinner size="lg" color="teal.500" />
      </Flex>
    );
  }

  if (!pin) {
    return null;
  }

  return (
    <Box maxW="lg" bg="white" p={6} borderRadius="md" shadow="sm">
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h2" size="md">
          交换记录详情
        </Heading>
        <HStack spacing={2}>
          <Button
            as={RouterLink}
            to="/"
            leftIcon={<FiArrowLeft />}
            variant="outline"
            size="sm"
          >
            返回列表
          </Button>
          <Button
            as={RouterLink}
            to={`/pins/${pin.id}/edit`}
            leftIcon={<FiEdit2 />}
            colorScheme="teal"
            size="sm"
          >
            编辑
          </Button>
        </HStack>
      </Flex>

      <VStack spacing={4} align="stretch">
        <Box>
          <Text fontSize="sm" color="gray.500" mb={1}>
            图案描述
          </Text>
          <Text fontSize="md" fontWeight="medium" color="gray.800">
            {pin.pattern_description}
          </Text>
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.500" mb={1}>
            来源
          </Text>
          <Text fontSize="md" color="gray.800">
            {pin.source}
          </Text>
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.500" mb={1}>
            交换对象
          </Text>
          <Text fontSize="md" color="gray.800">
            {pin.exchange_partner}
          </Text>
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.500" mb={1}>
            交换日期
          </Text>
          <Text fontSize="md" color="gray.800">
            {pin.exchange_date}
          </Text>
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.500" mb={1}>
            是否佩戴过
          </Text>
          <Badge colorScheme={pin.worn ? "green" : "gray"} px={2} py={1}>
            {pin.worn ? "是" : "否"}
          </Badge>
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.500" mb={1}>
            标签
          </Text>
          {renderTagBadges(pin.tags)}
        </Box>
      </VStack>
    </Box>
  );
}
