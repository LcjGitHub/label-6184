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
  Spinner,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { createPin, fetchPin, updatePin } from "../api/pins";
import type { PinFormData } from "../types/pin";
import WearingHistorySection from "../components/WearingHistorySection";

const defaultValues: PinFormData = {
  pattern_description: "",
  source: "",
  exchange_partner: "",
  exchange_date: "",
  worn: false,
  is_favorite: false,
};

/**
 * 徽章交换记录新增/编辑页
 */
export default function PinEditPage() {
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
  } = useForm<PinFormData>({ defaultValues });

  useEffect(() => {
    if (!isEdit || !id) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const pin = await fetchPin(Number(id));
        if (!cancelled) {
          reset({
            pattern_description: pin.pattern_description,
            source: pin.source,
            exchange_partner: pin.exchange_partner,
            exchange_date: pin.exchange_date,
            worn: pin.worn,
            is_favorite: pin.is_favorite,
          });
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
  }, [id, isEdit, navigate, reset, toast]);

  /**
   * 提交表单，创建或更新记录
   */
  const onSubmit = async (data: PinFormData) => {
    try {
      if (isEdit && id) {
        await updatePin(Number(id), data);
        toast({ title: "已保存", status: "success", duration: 2000 });
      } else {
        await createPin(data);
        toast({ title: "已创建", status: "success", duration: 2000 });
      }
      navigate("/");
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
        {isEdit ? "编辑交换记录" : "新增交换记录"}
      </Heading>

      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing={4} align="stretch">
          <FormControl isInvalid={Boolean(errors.pattern_description)}>
            <FormLabel>图案描述</FormLabel>
            <Input
              placeholder="例如：迪士尼米奇头像珐琅徽章"
              {...register("pattern_description", { required: "请填写图案描述" })}
            />
            <FormErrorMessage>{errors.pattern_description?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={Boolean(errors.source)}>
            <FormLabel>来源</FormLabel>
            <Input
              placeholder="例如：上海迪士尼园区商店"
              {...register("source", { required: "请填写来源" })}
            />
            <FormErrorMessage>{errors.source?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={Boolean(errors.exchange_partner)}>
            <FormLabel>交换对象</FormLabel>
            <Input
              placeholder="例如：来自东京的交换者 Ken"
              {...register("exchange_partner", { required: "请填写交换对象" })}
            />
            <FormErrorMessage>{errors.exchange_partner?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={Boolean(errors.exchange_date)}>
            <FormLabel>日期</FormLabel>
            <Input
              type="date"
              {...register("exchange_date", { required: "请选择日期" })}
            />
            <FormErrorMessage>{errors.exchange_date?.message}</FormErrorMessage>
          </FormControl>

          <FormControl>
            <Checkbox {...register("worn")}>是否佩戴过</Checkbox>
          </FormControl>

          <FormControl>
            <Checkbox {...register("is_favorite")}>是否收藏</Checkbox>
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
            <Button as={RouterLink} to="/" variant="outline">
              取消
            </Button>
          </Flex>
        </VStack>
      </form>

      {isEdit && id && <WearingHistorySection pinId={Number(id)} />}
    </Box>
  );
}
