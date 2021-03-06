<template>
  <a-form layout="vertical">
    <a-form-item v-bind="validateInfos.parent" label="父级分类">
      <a-select v-model:value="modelRef.parent" allow-clear>
        <a-select-option v-for="item in categoryList" :key="item._id">{{ item.title }}</a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item v-bind="validateInfos.title" label="分类名称">
      <a-input v-model:value="modelRef.title"></a-input>
    </a-form-item>
    <a-button :loading="loading" type="primary" @click="onSubmit">提交</a-button>
  </a-form>
</template>
<script lang="ts">
import { Form, Input, message, Select } from "ant-design-vue";
import { defineComponent, reactive, ref, PropType, watchEffect, SetupContext } from "vue";
import { useForm } from "ant-design-vue/lib/form";
import { CategoryCreateBody, CategoryModel } from "@/api/models";
import { CategoryService } from "@/api";
export default defineComponent({
  components: {
    [Form.name]: Form,
    [Form.Item.name]: Form.Item,
    [Input.name]: Input,
    [Select.name]: Select,
    "a-select-option": Select.Option,
  },
  props: {
    categoryList: {
      type: Array as PropType<CategoryModel[]>,
      default: () => [],
    },
  },
  emits: ["success"],
  setup(props, { emit }: SetupContext) {
    let loading = ref(false);
    let modelRef = reactive({
      parent: null,
      title: null,
    });
    const { validate, validateInfos } = useForm(
      modelRef,
      reactive({
        parent: [],
        title: [
          {
            required: true,
            message: "请填写分类名称",
          },
          {
            max: 20,
            message: "最多不超过20位",
          },
        ],
      })
    );
    // 校验并处理表单数据
    const onSubmit = async () => {
      validate().then((res) => {
        const body: CategoryCreateBody = {
          title: res.title,
          parent_id: res.parent,
        };
        createCategory(body);
      });
    };
    const createCategory = async (body: CategoryCreateBody) => {
      try {
        loading.value = true;
        const { success } = await CategoryService.create(body);
        if (success) {
          message.success("新建成功");
          emit("success");
        }
        loading.value = false;
      } catch (error: any) {
        loading.value = false;
        message.error(error.message);
      }
    };
    return {
      loading,
      modelRef,
      validateInfos,
      onSubmit,
    };
  },
});
</script>