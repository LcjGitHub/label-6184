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
  Card,
  CardBody,
  CardFooter,
  CardHeader,
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
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  Textarea,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { FiCalendar, FiEdit2, FiMapPin, FiPlus, FiTrash2, FiUsers } from "react-icons/fi";
import {
  createEvent,
  deleteEvent,
  fetchEvent,
  fetchEvents,
  updateEvent,
} from "../api/events";
import type { Event, EventFormData } from "../types/event";

const defaultValues: EventFormData = {
  name: "",
  event_date: "",
  location: "",
  max_attendees: 50,
  remark: "",
};

/**
 * 线下交换活动列表页
 */
export default function EventListPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
  const [editLoading, setEditLoading] = useState(false);
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
  } = useForm<EventFormData>({ defaultValues });

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchEvents();
      setEvents(data);
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
    loadEvents();
  }, [loadEvents]);

  /**
   * 打开新增弹窗
   */
  const handleAdd = () => {
    setEditingEvent(null);
    reset(defaultValues);
    editDialog.onOpen();
  };

  /**
   * 打开编辑弹窗，先调用后端查询单条接口再回填表单
   */
  const handleEdit = async (event: Event) => {
    setEditLoading(true);
    try {
      const fresh = await fetchEvent(event.id);
      setEditingEvent(fresh);
      setValue("name", fresh.name);
      setValue("event_date", fresh.event_date);
      setValue("location", fresh.location);
      setValue("max_attendees", fresh.max_attendees);
      setValue("remark", fresh.remark);
      editDialog.onOpen();
    } catch {
      toast({
        title: "加载失败",
        description: "活动不存在或后端服务异常",
        status: "error",
        duration: 3000,
      });
    } finally {
      setEditLoading(false);
    }
  };

  /**
   * 打开删除确认对话框
   */
  const handleDeleteRequest = (event: Event) => {
    setDeletingEvent(event);
    deleteDialog.onOpen();
  };

  /**
   * 确认删除活动并刷新列表
   */
  const handleDeleteConfirm = async () => {
    if (!deletingEvent) return;
    try {
      await deleteEvent(deletingEvent.id);
      toast({ title: "已删除", status: "success", duration: 2000 });
      deleteDialog.onClose();
      await loadEvents();
    } catch {
      toast({ title: "删除失败", status: "error", duration: 3000 });
    } finally {
      setDeletingEvent(null);
    }
  };

  /**
   * 取消删除
   */
  const handleDeleteCancel = () => {
    setDeletingEvent(null);
    deleteDialog.onClose();
  };

  /**
   * 提交表单，创建或更新活动
   */
  const onSubmit = async (data: EventFormData) => {
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, data);
        toast({ title: "已保存", status: "success", duration: 2000 });
      } else {
        await createEvent(data);
        toast({ title: "已创建", status: "success", duration: 2000 });
      }
      editDialog.onClose();
      await loadEvents();
    } catch {
      toast({ title: "保存失败", status: "error", duration: 3000 });
    }
  };

  /**
   * 格式化日期显示
   */
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  /**
   * 判断是否是近期活动（未来30天内）
   */
  const isUpcoming = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.ceil(
      (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays >= 0 && diffDays <= 30;
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
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h2" size="md">
          线下交换活动
        </Heading>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="teal"
          onClick={handleAdd}
          isLoading={editLoading}
          loadingText="加载中"
        >
          新增活动
        </Button>
      </Flex>

      {events.length === 0 ? (
        <Text color="gray.500" py={12} textAlign="center">
          暂无活动，点击「新增活动」添加第一场线下交换会。
        </Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {events.map((event) => (
            <Card
              key={event.id}
              variant="outline"
              _hover={{ shadow: "md", borderColor: "teal.300" }}
              transition="all 0.2s"
            >
              <CardHeader pb={2}>
                <Flex justify="space-between" align="flex-start">
                  <Box flex="1">
                    <Heading as="h3" size="sm" mb={2} color="teal.700">
                      {event.name}
                    </Heading>
                    {isUpcoming(event.event_date) && (
                      <Badge colorScheme="green" variant="subtle" mb={2}>
                        近期活动
                      </Badge>
                    )}
                  </Box>
                </Flex>
              </CardHeader>

              <CardBody pt={2}>
                <Stack spacing={3}>
                  <Flex align="center" gap={2} color="gray.600">
                    <FiCalendar />
                    <Text fontSize="sm">{formatDate(event.event_date)}</Text>
                  </Flex>
                  <Flex align="center" gap={2} color="gray.600">
                    <FiMapPin />
                    <Text fontSize="sm" noOfLines={1} title={event.location}>
                      {event.location}
                    </Text>
                  </Flex>
                  <Flex align="center" gap={2} color="gray.600">
                    <FiUsers />
                    <Text fontSize="sm">
                      人数上限：{event.max_attendees} 人
                    </Text>
                  </Flex>
                  {event.remark && (
                    <Text
                      fontSize="sm"
                      color="gray.500"
                      noOfLines={3}
                      mt={2}
                      pt={2}
                      borderTop="1px solid"
                      borderColor="gray.100"
                    >
                      {event.remark}
                    </Text>
                  )}
                </Stack>
              </CardBody>

              <CardFooter pt={0} justify="flex-end" gap={2}>
                <IconButton
                  aria-label="编辑"
                  icon={<FiEdit2 />}
                  size="sm"
                  variant="ghost"
                  colorScheme="teal"
                  isLoading={editLoading}
                  onClick={() => handleEdit(event)}
                />
                <IconButton
                  aria-label="删除"
                  icon={<FiTrash2 />}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => handleDeleteRequest(event)}
                />
              </CardFooter>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <Modal isOpen={editDialog.isOpen} onClose={editDialog.onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingEvent ? "编辑活动" : "新增活动"}
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
                  <FormLabel>活动名称</FormLabel>
                  <Input
                    placeholder="例如：2026上海徽章交换大会"
                    {...register("name", { required: "请填写活动名称" })}
                  />
                  <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={Boolean(errors.event_date)}>
                  <FormLabel>举办日期</FormLabel>
                  <Input
                    type="date"
                    {...register("event_date", { required: "请选择举办日期" })}
                  />
                  <FormErrorMessage>{errors.event_date?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={Boolean(errors.location)}>
                  <FormLabel>举办地点</FormLabel>
                  <Input
                    placeholder="例如：上海国际会展中心B馆"
                    {...register("location", { required: "请填写举办地点" })}
                  />
                  <FormErrorMessage>{errors.location?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={Boolean(errors.max_attendees)}>
                  <FormLabel>人数上限</FormLabel>
                  <Input
                    type="number"
                    min={1}
                    {...register("max_attendees", {
                      required: "请填写人数上限",
                      min: { value: 1, message: "人数上限至少为1" },
                      valueAsNumber: true,
                    })}
                  />
                  <FormErrorMessage>
                    {errors.max_attendees?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel>活动备注</FormLabel>
                  <Textarea
                    placeholder="可选，记录活动详情、注意事项等"
                    {...register("remark")}
                    rows={3}
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
              确定删除活动「{deletingEvent?.name}」吗？此操作不可撤销。
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
