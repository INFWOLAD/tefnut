import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useRouter } from 'expo-router';
import { useStore as useBtStore } from '@/stores/bt/btInfo';
import { showSuccessAlert } from '@/components/ui/alert';
import Constants from 'expo-constants';

export default function HomeScreen() {
	const env = Constants.expoConfig?.extra?.APP_ENV;
	const router = useRouter();
	const btloginfo = useBtStore();
	return (
		<View
			style={{
				flex: 1,
				gap: 22,
				padding: 20,
				justifyContent: 'center',
			}}
		>
			<Text
				variant="heading"
				style={{
					textAlign: 'center',
				}}
			>
				Tefnut ({env !== 'production' && env})
			</Text>

			{/* <Link asChild href="/sheet">
        <Button>Open Components Sheet</Button>
      </Link> */}
			<Button
				onPress={() => {
					console.log('Navigating to /bt/manage');
					btloginfo.loggedIn
						? router.push('/bt/manage')
						: showSuccessAlert('请确认登录状态', '您可以在设置-BT设置中登入以使用该功能', () =>
								console.log('未登录完成'),
							);
				}}
			>
				磁力管理
			</Button>
			<Button
				onPress={() => {
					console.log('Navigating to /tally/index');
					router.push('/tally');
				}}
			>
				账单管理
			</Button>
		</View>
	);
}
