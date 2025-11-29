// 公共请求方法，实例：
// const controller = createRequestController();

// request({
//   url: "/api/v1/slow-task",
//   method: "POST",
//   controller,
// }).catch(() => {});

// // 3 秒后中断
// setTimeout(() => {
//   controller.abort(); // 无 toast
// }, 3000);

// 封装的axios，请注意因为使用toast弹出信息，调用的组件必须包裹<ToastProvider>，传入toast给request
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
// 创建 axios 实例
const instance = axios.create({
  timeout: 10000,
  withCredentials: true,
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 不 toast，这部分由封装的 request 控制
    return Promise.reject(error);
  }
);

// -------------------------
// 支持静默 & 中断的封装方法
// -------------------------

interface RequestOptions extends AxiosRequestConfig {
  silence?: boolean; // 是否静默（不弹 toast）
  controller?: AbortController; // 外部传入 abort controller
  toast: any; // 传入useToast的toast
  specialErr?: {
    keywords: string; // 错误关键词，用于http status无法判断错误信息时
    msg: string; // 检测到关键词时返回的错误信息
  };
}

export async function request<T = any>(options: RequestOptions): Promise<T> {
  const { silence = false, controller, toast, specialErr, ...rest } = options;

  const abortController = controller ?? new AbortController();
  const signal = abortController.signal;

  try {
    console.log("请求发出", rest);
    const res: AxiosResponse<T> = await instance({
      ...rest,
      signal,
    });
    console.log("请求返回", res.data);
    // 自定义错误关键词和错误展示信息
    if (
      typeof res.data === "string" &&
      specialErr &&
      res.data.includes(specialErr.keywords)
    ) {
      toast({
        title: "错误",
        description: specialErr.msg,
        variant: "error",
      });
      return Promise.reject(specialErr.msg);
    }
    return res.data;
  } catch (err: any) {
    // 如果是手动中断，不弹 toast
    if (axios.isCancel(err) || err?.name === "CanceledError") {
      console.log("Request aborted:", rest.url);
      return Promise.reject(err);
    }
    if (!silence) {
      const msg =
        err?.response?.data?.message || err?.message || "请求失败，请稍后重试";

      toast({
        title: "错误",
        description: msg,
        variant: "error",
      });
    }

    return Promise.reject(err);
  }
}

// 请求前创建abort，随后调用request发起请求时传入该实例
export function createRequestController() {
  return new AbortController();
}
