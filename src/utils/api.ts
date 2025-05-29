import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  type Method,
} from 'axios'
import { showToast, showConfirmDialog } from 'vant' // 从 Vant 引入 Toast 和 Dialog
import 'vant/es/toast/style' // 引入 Vant Toast 的样式
import 'vant/es/dialog/style' // 引入 Vant Dialog 的样式

// 定义通用的 API 响应结构 (根据您的后端接口调整)
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 定义请求配置，可以扩展 AxiosRequestConfig
export interface CustomRequestConfig extends AxiosRequestConfig {
  // 是否跳过全局错误处理
  skipErrorHandler?: boolean
  // 是否显示全局 loading (如果需要)
  showLoading?: boolean
  // Toast持续时间 (ms)，设置为0则持续展示
  toastDuration?: number
}

// 创建 Axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // 从环境变量读取 API 基础路径
  //baseURL: 'http://localhost:8080/api', // 示例: 通常在 vite.config.js 或 vue.config.js 中配置代理
  timeout: 10000, // 请求超时时间 (毫秒)
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 在发送请求之前做些什么
    // 例如，添加 token
    const token = localStorage.getItem('authToken') // 或者从 Vuex/Pinia store 中获取
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 如果配置了 showLoading，可以在这里处理全局 loading 的显示
    // if ((config as CustomRequestConfig).showLoading) {
    //   showGlobalLoading(); // 您需要自行实现全局 loading 函数
    // }

    return config
  },
  (error: any) => {
    // 对请求错误做些什么
    console.error('Request Interceptor Error:', error) // 用于调试
    return Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // 对响应数据做点什么
    // if ((response.config as CustomRequestConfig).showLoading) {
    //   hideGlobalLoading(); // 您需要自行实现全局 loading 函数
    // }

    const res = response.data
    const customConfig = response.config as CustomRequestConfig

    // 假设 code 为 0 代表成功，其他为错误 (根据后端调整)
    if (res.code !== 0) {
      // 如果配置了跳过全局错误处理，则直接返回原始响应或错误
      if (customConfig.skipErrorHandler) {
        return Promise.reject(res)
      }

      // 统一错误处理
      showToast({
        message: res.message || 'Error',
        type: 'fail', // Vant 中通常用 'fail' 表示错误
        duration: customConfig.toastDuration || 3000, // 默认3秒
      })

      // 示例：特定错误码处理
      if (res.code === 401 || res.code === 403) {
        // 例如：Token 过期或无权限，则重新登录
        showConfirmDialog({
          title: '确认登出',
          message: '您已登出，可以取消以停留在此页面，或重新登录',
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
        })
          .then(() => {
            // 点击确认
            // store.dispatch('user/resetToken').then(() => { // 调用 Pinia/Vuex action
            //   location.reload(); // 为了重新实例化vue-router对象，避免bug
            // });
            console.log('Redirect to login')
            // window.location.href = '/login'; // 跳转到登录页
          })
          .catch(() => {
            // 点击取消
            console.log('User cancelled login redirect')
          })
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      // 成功，直接返回 data 部分
      return res.data
    }
  },
  (error: any) => {
    // 对响应错误做点什么
    const customConfig = error.config as CustomRequestConfig
    // if (customConfig?.showLoading) {
    //   hideGlobalLoading(); // 您需要自行实现全局 loading 函数
    // }
    console.error('Response Interceptor Error:', error) // 用于调试

    // 如果配置了跳过全局错误处理，则直接返回原始错误
    if (customConfig?.skipErrorHandler) {
      return Promise.reject(error)
    }

    let errorMessage = '网络请求失败，请稍后重试'
    if (error.response) {
      // 请求已发出，但服务器响应的状态码不在 2xx 范围内
      switch (error.response.status) {
        case 400:
          errorMessage = '请求错误(400)'
          break
        case 401:
          errorMessage = '未授权，请重新登录(401)'
          // 可在此处统一处理跳转登录页的逻辑
          // window.location.href = '/login';
          break
        case 403:
          errorMessage = '拒绝访问(403)'
          break
        case 404:
          errorMessage = `请求地址出错: ${error.response.config.url}(404)`
          break
        case 408:
          errorMessage = '请求超时(408)'
          break
        case 500:
          errorMessage = '服务器内部错误(500)'
          break
        case 501:
          errorMessage = '服务未实现(501)'
          break
        case 502:
          errorMessage = '网络错误(502)'
          break
        case 503:
          errorMessage = '服务不可用(503)'
          break
        case 504:
          errorMessage = '网络超时(504)'
          break
        case 505:
          errorMessage = 'HTTP版本不受支持(505)'
          break
        default:
          errorMessage = `连接错误: ${error.response.status}`
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应 (例如网络问题)
      errorMessage = '未能连接到服务器，请检查网络'
    } else {
      // 在设置请求时触发了一个错误
      errorMessage = error.message || '请求失败'
    }

    showToast({
      message: errorMessage,
      type: 'fail',
      duration: customConfig?.toastDuration || 3000,
    })
    return Promise.reject(error)
  },
)

// 封装通用的请求方法，并提供泛型支持
const request = <T = any>(
  method: Method,
  url: string,
  dataOrParams?: any,
  config?: CustomRequestConfig,
): Promise<T> => {
  const reqConfig: CustomRequestConfig = { method, url, ...config }

  if (method.toLowerCase() === 'get' || method.toLowerCase() === 'delete') {
    reqConfig.params = dataOrParams
  } else {
    reqConfig.data = dataOrParams
  }
  return service(reqConfig) as Promise<T>
}

// 常用请求方法的快捷方式
export const http = {
  get: <T = any>(url: string, params?: any, config?: CustomRequestConfig): Promise<T> =>
    request<T>('GET', url, params, config),

  post: <T = any>(url: string, data?: any, config?: CustomRequestConfig): Promise<T> =>
    request<T>('POST', url, data, config),

  put: <T = any>(url: string, data?: any, config?: CustomRequestConfig): Promise<T> =>
    request<T>('PUT', url, data, config),

  delete: <T = any>(url: string, params?: any, config?: CustomRequestConfig): Promise<T> =>
    request<T>('DELETE', url, params, config),

  upload: <T = any>(url: string, formData: FormData, config?: CustomRequestConfig): Promise<T> => {
    const defaultConfig: CustomRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    }
    return request<T>('POST', url, formData, defaultConfig)
  },
}

export default service // 也可直接导出 http 对象

/*
// 如何在 Vue 组件或 API service 中使用：
import { http } from './path/to/this/file'; // 假设此文件名为 request.ts
import { showToast } from 'vant';

interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchUser(userId: number): Promise<User> {
  try {
    const userData = await http.get<User>(`/users/${userId}`);
    console.log(userData.name);
    return userData;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}

async function createUser(userData: Omit<User, 'id'>): Promise<User> {
 try {
    const newUser = await http.post<User>('/users', userData);
    showToast({ message: '用户创建成功！', type: 'success' });
    return newUser;
  } catch (error) {
    console.error('Failed to create user:', error);
    throw error;
  }
}

// 使用 skipErrorHandler
async function fetchSensitiveData() {
  try {
    const data = await http.get<any>('/sensitive-data', {}, { skipErrorHandler: true, toastDuration: 0 }); // toast持续展示
    if (data.code !== 0) {
        console.warn('Sensitive data error:', data.message);
        showToast(`敏感数据获取警告: ${data.message}`);
    }
    return data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
        showToast('敏感数据未找到');
    } else {
        showToast(`获取敏感数据失败: ${error.message || '未知错误'}`);
    }
    throw error;
  }
}

*/
