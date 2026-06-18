import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import {
  createSeries,
  deleteSeries,
  fetchOneSeries,
  fetchSeries,
  updateSeries,
} from "../api/series";
import type { Series, SeriesFormData } from "../types/series";

const defaultValues: SeriesFormData = {
  name: "",
  brand: "",
  description: "",
};

/**
 * 徽章系列分类列表页
 */
export default function SeriesListPage() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [deletingSeries, setDeletingSeries] = useState<Series | null>(null);
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();
  const editDialog = useDisclosure();
  const deleteDialog = useDisclosure();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SeriesFormData>({ defaultValues });

  const loadSeries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSeries();
      setSeriesList(data);
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
    loadSeries();
  }, [loadSeries]);

  /**
   * 打开新增弹窗
   */
  const handleAdd = () => {
    setEditingSeries(null);
    reset(defaultValues);
    editDialog.onOpen();
  };

  /**
   * 打开编辑弹窗，先调用后端查询单条接口再回填表单
   */
  const handleEdit = async (series: Series) => {
    setEditingRowId(series.id);
    try {
      const fresh = await fetchOneSeries(series.id);
      setEditingSeries(fresh);
      setValue("name", fresh.name);
      setValue("brand", fresh.brand);
      setValue("description", fresh.description);
      editDialog.onOpen();
    } catch {
      toast({
        title: "加载失败",
        description: "系列不存在或后端服务异常",
        status: "error",
        duration: 3000,
      });
    } finally {
      setEditingRowId(null);
    }
  };

  /**
   * 打开删除确认对话框
   */
  const handleDeleteRequest = (series: Series) => {
    setDeletingSeries(series);
    deleteDialog.onOpen();
  };

  /**
   * 确认删除系列并刷新列表
   */
  const handleDeleteConfirm = async () => {
    if (!deletingSeries) return;
    try {
      await deleteSeries(deletingSeries.id);
      toast({ title: "已删除", status: "success", duration: 2000 });
      deleteDialog.onClose();
      await loadSeries();
    } catch {
      toast({ title: "删除失败", status: "error", duration: 3000 });
    } finally {
      setDeletingSeries(null);
    }
  };

  /**
   * 取消删除
   */
  const handleDeleteCancel = () => {
    setDeletingSeries(null);
    deleteDialog.onClose();
  };

  /**
   * 提交表单，创建或更新系列
   */
  const onSubmit = async (data: SeriesFormData) => {
    try {
      if (editingSeries) {
        await updateSeries(editingSeries.id, data);
        toast({ title: "已保存", status: "success", duration: 2000 });
      } else {
        await createSeries(data);
        toast({ title: "已创建", status: "success", duration: 2000 });
      }
      editDialog.onClose();
      await loadSeries();
    } catch {
      toast({ title: "保存失败", status: "error", duration: 3000 });
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
          徽章系列分类
        </Heading>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="teal"
          onClick={handleAdd}
          isLoading={editingRowId !== null}
          loadingText="加载中"
        >
          新增系列
        </Button>
      </Flex>

      {seriesList.length === 0 ? (
        <Text color="gray.500" py={8} textAlign="center">
          暂无系列分类，点击「新增系列」添加第一个徽章系列。
        </Text>
      ) : (
        <Box overflowX="auto" bg="white" borderRadius="md" shadow="sm">
          <Table size="md">
            <Thead bg="gray.100">
              <Tr>
                <Th>系列名称</Th>
                <Th>所属品牌</Th>
                <Th>系列简介</Th>
                <Th textAlign="right">操作</Th>
              </Tr>
            </Thead>
            <Tbody>
              {seriesList.map((series) => (
                <Tr key={series.id} _hover={{ bg: "gray.50" }}>
                  <Td fontWeight="medium">{series.name}</Td>
                  <Td>{series.brand}</Td>
                  <Td maxW="lg">
                    {series.description || <Text color="gray.400">—</Text>}
                  </Td>
                  <Td textAlign="right">
                    <IconButton
                      aria-label="编辑"
                      icon={<FiEdit2 />}
                      size="sm"
                      variant="ghost"
                      colorScheme="teal"
                      isLoading={editingRowId === series.id}
                      onClick={() => handleEdit(series)}
                    />
                    <IconButton
                      aria-label="删除"
                      icon={<FiTrash2 />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      ml={1}
                      onClick={() => handleDeleteRequest(series)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <Modal isOpen={editDialog.isOpen} onClose={editDialog.onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingSeries ? "编辑系列" : "新增系列"}
          </ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody>
              <Box
                display="flex"
                flexDirection="column"
                gap={4}
                alignItems="stretch"
              >
                <FormControl isInvalid={Boolean(errors.name)}>
                  <FormLabel>系列名称</FormLabel>
                  <Input
                    placeholder="例如：迪士尼经典系列"
                    {...register("name", { required: "请填写系列名称" })}
                  />
                  <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={Boolean(errors.brand)}>
                  <FormLabel>所属品牌</FormLabel>
                  <Input
                    placeholder="例如：Disney"
                    {...register("brand", { required: "请填写所属品牌" })}
                  />
                  <FormErrorMessage>{errors.brand?.message}</FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel>系列简介</FormLabel>
                  <Textarea
                    placeholder="可选，描述该系列的特点、包含的主题等信息"
                    {...register("description")}
                    rows={4}
                    resize="vertical"
                  />
                </FormControl>
              </Box>
            </ModalBody>
            <ModalFooter gap={3}>
              <Button variant="outline" onClick={editDialog.onClose}>
                取消
              </Button>
              <Button
                type="submit"
                colorScheme="teal"
                isLoading={isSubmitting}
                loadingText="保存中"
              >
                保存
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={deleteDialog.isOpen}
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
              确定删除系列「{deletingSeries?.name}」吗？此操作不可撤销。
            </AlertDialogBody>
            <AlertDialogFooter gap={3}>
              <Button ref={cancelRef} variant="outline" onClick={handleDeleteCancel}>
                取消
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm}>
                删除
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
