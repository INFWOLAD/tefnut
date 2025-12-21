import { useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { request } from '@/utils/request';
import { useToast } from '@/components/ui/toast';

// 登录提交方法，请确保调用时调用screen已被toast包裹
export function useBtLogin() {
	const [loading, setLoading] = useState(false);
	const { toast } = useToast();

	async function btLogin(
		Url: string,
		Username: string,
		Password: string, // 登录三要素
		controller?: AbortController, // 中断用
		silence?: boolean, // 默认false不静默
	) {
		console.log('Logging in with:', { Username, Password, Url });
		// 开启loading，此时对外暴露为true
		setLoading(true);
		// 此处调用qb web api
		try {
			await request({
				url: `${Url}/api/v2/auth/login`,
				data: `username=${Username}&password=${Password}`,
				headers: {
					Referer: 'http://localhost:8080/',
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				method: 'POST',
				toast,
				specialErr: { keywords: 'Fails.', msg: '请重新输入登录信息' },
				controller,
				silence,
			});
			// 无报错存入信息
			SecureStore.setItemAsync('bt_username', Username);
			SecureStore.setItemAsync('bt_password', Password);
			SecureStore.setItemAsync('bt_url', Url);
			// 返回登录状态
			return true;
		} catch (error) {
			console.log(error);
			return false;
		} finally {
			// loading状态更新，外部实时获取
			setLoading(false);
		}
	}
	//   对外给登录方法以及登录loading
	return { btLogin, loading };
}
