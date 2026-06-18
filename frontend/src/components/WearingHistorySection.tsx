import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { FiTrash2 } from "react-icons/fi";
import {
  createWearingHistory,
  deleteWearingHistory,
  fetchWearingHistory,
} from "../api/wearingHistory";
import type { WearingHistory, WearingHistoryFormData } from "../types/wearingHistory";

interface Props {
  pinId: number;
}

const defaultFormValues: WearingHistoryFormData = {
  wear_date: "",
  occasion: "",
  remarks: "",
};

export default function WearingHistorySection({ pinId }: Props) {
  const [records, setRecords] = useState<WearingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<WearingHistory | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WearingHistoryFormData>({ defaultValues: defaultFormValues });

  const loadRecords = useCallback(async () => {
    try {
      const data = await fetchWearingHistory(pinId);
      setRecords(data);
    } catch {
      toast({ title: "加载佩戴历史失败", status: "error", duration: 3000 });
    } finally {
      setLoading(false);
    }
  }, [pinId, toast]);

  useEffect(() => {
    setLoading(true);
    loadRecords();
  }, [loadRecords]);

  const onAdd = async (data: WearingHistoryFormData) => {
    try {
      await createWearingHistory(pinId, data);
      toast({ title: "佩戴记录已添加", status: "success", duration: 2000 });
      reset(defaultFormValues);
      await loadRecords();
    } catch {
      toast({ title: "添加失败", status: "error", duration: 3000 });
    }
  };

  const onConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteWearingHistory(deleteTarget.id);
      toast({ title: "佩戴记录已删除", status: "success", duration: 2000 });
      await loadRecords();
    } catch {
      toast({ title: "删除失败", status: "error", duration: 3000 });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteTarget(null);
  };

  return (
    <Box mt={8}>
      <Heading as="h3" size="sm" mb={4} color="teal.600">
        佩戴历史
      </Heading>

      <Box mb={4} p={4} bg="gray.50" borderRadius="md">
        <Heading as="h4" size="xs" mb={3} color="gray.600">
          添加佩戴记录
        </Heading>
        <form onSubmit={handleSubmit(onAdd)}>
          <VStack spacing={3} align="stretch">
            <Flex gap={3} direction={{ base: "column", md: "row" }}>
              <FormControl isInvalid={Boolean(errors.wear_date)} flex={1}>
                <FormLabel fontSize="sm">佩戴日期</FormLabel>
                <Input
                  type="date"
                  bg="white"
                  size="sm"
                  {...register("wear_date", { required: "请选择佩戴日期" })}
                />
                <FormErrorMessage>{errors.wear_date?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={Boolean(errors.occasion)} flex={1}>
                <FormLabel fontSize="sm">佩戴场合</FormLabel>
                <Input
                  placeholder="例如：公司年会"
                  bg="white"
                  size="sm"
                  {...register("occasion", { required: "请填写佩戴场合" })}
                />
                <FormErrorMessage>{errors.occasion?.message}</FormErrorMessage>
              </FormControl>

              <FormControl flex={1}>
                <FormLabel fontSize="sm">备注</FormLabel>
                <Input
                  placeholder="选填"
                  bg="white"
                  size="sm"
                  {...register("remarks")}
                />
              </FormControl>
            </Flex>

            <Button
              type="submit"
              colorScheme="teal"
              size="sm"
              alignSelf="flex-end"
              isLoading={isSubmitting}
              loadingText="添加中"
            >
              添加记录
            </Button>
          </VStack>
        </form>
      </Box>

      {loading ? (
        <Flex justify="center" py={4}>
          <Spinner size="sm" color="teal.500" />
        </Flex>
      ) : records.length === 0 ? (
        <Text color="gray.500" fontSize="sm" py={4} textAlign="center">
          暂无佩戴记录
        </Text>
      ) : (
        <Box overflowX="auto">
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th>佩戴日期</Th>
                <Th>佩戴场合</Th>
                <Th>备注</Th>
                <Th width="60px">操作</Th>
              </Tr>
            </Thead>
            <Tbody>
              {records.map((record) => (
                <Tr key={record.id}>
                  <Td>
                    <Badge colorScheme="teal" variant="subtle">
                      {record.wear_date}
                    </Badge>
                  </Td>
                  <Td>{record.occasion}</Td>
                  <Td color="gray.600">{record.remarks || "—"}</Td>
                  <Td>
                    <IconButton
                      aria-label="删除"
                      icon={<FiTrash2 />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => setDeleteTarget(record)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <AlertDialog
        isOpen={Boolean(deleteTarget)}
        leastDestructiveRef={cancelRef}
        onClose={handleDeleteCancel}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              确认删除
            </AlertDialogHeader>
            <AlertDialogBody>
              确定要删除 {deleteTarget?.wear_date} 的佩戴记录吗？此操作不可撤销。
            </AlertDialogBody>
            <AlertDialogFooter gap={3}>
              <Button ref={cancelRef} variant="outline" onClick={handleDeleteCancel}>
                取消
              </Button>
              <Button colorScheme="red" onClick={onConfirmDelete}>
                删除
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
