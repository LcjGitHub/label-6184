import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Select,
  Spinner,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { createWish, fetchWish, updateWish } from "../api/wishes";
import type { WishFormData } from "../types/wish";

const defaultValues: WishFormData = {
  pattern_description: "",
  expected_source: "",
  priority: "中",
  achieved: false,
};

/**
 * 愿望清单新增/编辑页
 */
export default function WishEditPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(isEdit);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WishFormData>({ defaultValues });

  useEffect(() => {
    if (!isEdit || !id) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const wish = await fetchWish(Number(id));
        if (!cancelled) {
          reset({
            pattern_description: wish.pattern_description,
            expected_source: wish.expected_source,
            priority: wish.priority,
            achieved: wish.achieved,
          });
        }
      } catch {
        if (!cancelled) {
          toast({
            title: "加载失败",
            description: "愿望不存在或后端未启动",
            status: "error",
            duration: 4000,
          });
          navigate("/wishes");
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
  }, [id, isEdit, navigate, reset, toast]);

  /**
   * 提交表单，创建或更新愿望
   */
  const onSubmit = async (data: WishFormData) => {
    try {
      if (isEdit && id) {
        await updateWish(Number(id), data);
        toast({ title: "已保存", status: "success", duration: 2000 });
      } else {
        await createWish(data);
        toast({ title: "已创建", status: "success", duration: 2000 });
      }
      navigate("/wishes");
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
    <Box maxW="lg" bg="white" p={6} borderRadius="md" shadow="sm">
      <Heading as="h2" size="md" mb={6}>
        {isEdit ? "编辑愿望" : "新增愿望"}
      </Heading>

      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing={4} align="stretch">
          <FormControl isInvalid={Boolean(errors.pattern_description)}>
            <FormLabel>目标图案描述</FormLabel>
            <Input
              placeholder="例如：星黛露春日限定珐琅徽章"
              {...register("pattern_description", { required: "请填写图案描述" })}
            />
            <FormErrorMessage>{errors.pattern_description?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={Boolean(errors.expected_source)}>
            <FormLabel>期望来源</FormLabel>
            <Input
              placeholder="例如：上海迪士尼乐园2026春季新品"
              {...register("expected_source", { required: "请填写期望来源" })}
            />
            <FormErrorMessage>{errors.expected_source?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={Boolean(errors.priority)}>
            <FormLabel>优先级</FormLabel>
            <Select
              {...register("priority", { required: "请选择优先级" })}
            >
              <option value="高">高</option>
              <option value="中">中</option>
              <option value="低">低</option>
            </Select>
            <FormErrorMessage>{errors.priority?.message}</FormErrorMessage>
          </FormControl>

          <FormControl>
            <Checkbox {...register("achieved")}>是否已达成</Checkbox>
          </FormControl>

          <Flex gap={3} pt={2}>
            <Button
              type="submit"
              colorScheme="teal"
              isLoading={isSubmitting}
              loadingText="保存中"
            >
              保存
            </Button>
            <Button as={RouterLink} to="/wishes" variant="outline">
              取消
            </Button>
          </Flex>
        </VStack>
      </form>
    </Box>
  );
}
