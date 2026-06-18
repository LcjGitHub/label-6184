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
  createContact,
  deleteContact,
  fetchContact,
  fetchContacts,
  updateContact,
} from "../api/contacts";
import type { Contact, ContactFormData } from "../types/contact";

const defaultValues: ContactFormData = {
  nickname: "",
  city: "",
  contact_info: "",
  remark: "",
};

/**
 * 交换对象通讯录列表页
 */
export default function ContactListPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);
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
  } = useForm<ContactFormData>({ defaultValues });

  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchContacts();
      setContacts(data);
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
    loadContacts();
  }, [loadContacts]);

  /**
   * 打开新增弹窗
   */
  const handleAdd = () => {
    setEditingContact(null);
    reset(defaultValues);
    editDialog.onOpen();
  };

  /**
   * 打开编辑弹窗，先调用后端查询单条接口再回填表单
   */
  const handleEdit = async (contact: Contact) => {
    setEditLoading(true);
    try {
      const fresh = await fetchContact(contact.id);
      setEditingContact(fresh);
      setValue("nickname", fresh.nickname);
      setValue("city", fresh.city);
      setValue("contact_info", fresh.contact_info);
      setValue("remark", fresh.remark);
      editDialog.onOpen();
    } catch {
      toast({
        title: "加载失败",
        description: "联系人不存在或后端服务异常",
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
  const handleDeleteRequest = (contact: Contact) => {
    setDeletingContact(contact);
    deleteDialog.onOpen();
  };

  /**
   * 确认删除联系人并刷新列表
   */
  const handleDeleteConfirm = async () => {
    if (!deletingContact) return;
    try {
      await deleteContact(deletingContact.id);
      toast({ title: "已删除", status: "success", duration: 2000 });
      deleteDialog.onClose();
      await loadContacts();
    } catch {
      toast({ title: "删除失败", status: "error", duration: 3000 });
    } finally {
      setDeletingContact(null);
    }
  };

  /**
   * 取消删除
   */
  const handleDeleteCancel = () => {
    setDeletingContact(null);
    deleteDialog.onClose();
  };

  /**
   * 提交表单，创建或更新联系人
   */
  const onSubmit = async (data: ContactFormData) => {
    try {
      if (editingContact) {
        await updateContact(editingContact.id, data);
        toast({ title: "已保存", status: "success", duration: 2000 });
      } else {
        await createContact(data);
        toast({ title: "已创建", status: "success", duration: 2000 });
      }
      editDialog.onClose();
      await loadContacts();
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
          交换对象通讯录
        </Heading>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="teal"
          onClick={handleAdd}
          isLoading={editLoading}
          loadingText="加载中"
        >
          新增联系人
        </Button>
      </Flex>

      {contacts.length === 0 ? (
        <Text color="gray.500" py={8} textAlign="center">
          暂无联系人，点击「新增联系人」添加第一位交换伙伴。
        </Text>
      ) : (
        <Box overflowX="auto" bg="white" borderRadius="md" shadow="sm">
          <Table size="md">
            <Thead bg="gray.100">
              <Tr>
                <Th>昵称</Th>
                <Th>所在城市</Th>
                <Th>联系方式</Th>
                <Th>备注</Th>
                <Th textAlign="right">操作</Th>
              </Tr>
            </Thead>
            <Tbody>
              {contacts.map((contact) => (
                <Tr key={contact.id} _hover={{ bg: "gray.50" }}>
                  <Td fontWeight="medium">{contact.nickname}</Td>
                  <Td>{contact.city}</Td>
                  <Td>{contact.contact_info}</Td>
                  <Td>{contact.remark || <Text color="gray.400">—</Text>}</Td>
                  <Td textAlign="right">
                    <IconButton
                      aria-label="编辑"
                      icon={<FiEdit2 />}
                      size="sm"
                      variant="ghost"
                      colorScheme="teal"
                      isLoading={editLoading}
                      onClick={() => handleEdit(contact)}
                    />
                    <IconButton
                      aria-label="删除"
                      icon={<FiTrash2 />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      ml={1}
                      onClick={() => handleDeleteRequest(contact)}
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
            {editingContact ? "编辑联系人" : "新增联系人"}
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
                <FormControl isInvalid={Boolean(errors.nickname)}>
                  <FormLabel>昵称</FormLabel>
                  <Input
                    placeholder="例如：Ken"
                    {...register("nickname", { required: "请填写昵称" })}
                  />
                  <FormErrorMessage>{errors.nickname?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={Boolean(errors.city)}>
                  <FormLabel>所在城市</FormLabel>
                  <Input
                    placeholder="例如：东京"
                    {...register("city", { required: "请填写所在城市" })}
                  />
                  <FormErrorMessage>{errors.city?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={Boolean(errors.contact_info)}>
                  <FormLabel>联系方式</FormLabel>
                  <Input
                    placeholder="例如：邮箱、微信、电话等"
                    {...register("contact_info", { required: "请填写联系方式" })}
                  />
                  <FormErrorMessage>
                    {errors.contact_info?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel>备注</FormLabel>
                  <Textarea
                    placeholder="可选，记录该交换伙伴的偏好或历史交换信息"
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
              确定删除联系人「{deletingContact?.nickname}」吗？此操作不可撤销。
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
