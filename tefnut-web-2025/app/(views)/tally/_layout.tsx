import { router, Stack } from 'expo-router';
import { Platform, useColorScheme, Pressable } from 'react-native';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { useColor } from '@/hooks/useColor';
import { Icon } from '@/components/ui/icon';
import { Home } from 'lucide-react-native';
import { ToastProvider } from '@/components/ui/toast';
export default function BtLayout() {
	const theme = useColorScheme();
	const text = useColor('text');
	const background = useColor('background');
	const primary = useColor('primary');

	return (
		<ToastProvider>
			<Stack
				screenOptions={{
					headerLargeTitle: false,
					headerLargeTitleShadowVisible: false,
					headerTransparent: Platform.OS === 'ios' ? true : false,
					headerTintColor: text,
					headerBlurEffect: isLiquidGlassAvailable()
						? undefined
						: theme === 'dark'
							? 'systemMaterialDark'
							: 'systemMaterialLight',
					headerStyle: {
						backgroundColor: isLiquidGlassAvailable() ? 'transparent' : background,
					},
				}}
			>
				<Stack.Screen
					name="index"
					options={{
						title: '',
						headerTitle: undefined,
						headerLeft: () => (
							<Pressable
								onPress={() => {
									router.dismissAll();
									router.replace('/');
								}}
								style={{
									padding: 6,
									justifyContent: 'center',
									alignItems: 'center',
								}}
							>
								<Icon name={Home} size={24} color={primary} />
							</Pressable>
						),
					}}
				/>
			</Stack>
		</ToastProvider>
	);
}
