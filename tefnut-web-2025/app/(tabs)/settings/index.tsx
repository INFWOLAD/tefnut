import { ScrollView } from '@/components/ui/scroll-view';
import { View } from '@/components/ui/view';
import * as Application from 'expo-application';
import { Text } from '@/components/ui/text';
import { AvoidKeyboard } from '@/components/ui/avoid-keyboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColor } from '@/hooks/useColor';
import BtSetting from '@/components/bt/btSetting';
import DeSetting from '@/components/development/deSetting';
import Constants from 'expo-constants';
import { useState } from 'react';
import { Pressable } from 'react-native';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	cancelAnimation,
} from 'react-native-reanimated';

export default function SettingsScreen() {
	// 包版本相关
	const appVersion = Application.nativeApplicationVersion || 'dev';
	const buildNumber = Application.nativeBuildVersion;
	const env = Constants.expoConfig?.extra?.APP_ENV;
	// textinput组件用颜色
	const themeColor = useColor('text');
	// 开发者选项
	const [manualDev, setManualDev] = useState(false);
	// 动画配置
	const pressProgress = useSharedValue(0.3);
	const successAnimation = useSharedValue(0);
	const animatedStyle = useAnimatedStyle(() => ({
		opacity: pressProgress.value,
	}));
	const animatedSuccessStyle = useAnimatedStyle(() => ({
		transform: [{ scale: 1 + successAnimation.value * 0.01 }],
	}));

	return (
		<SafeAreaView style={{ flex: 1 }} edges={['right', 'top', 'left']}>
			<ScrollView
				style={{
					flex: 1,
					paddingTop: 24,
					paddingHorizontal: 8,
				}}
			>
				<Text
					style={{
						color: themeColor,
						opacity: 0.6,
						marginLeft: 4,
						fontSize: 14,
					}}
				>
					磁力管理设置
				</Text>
				{/* 磁力管理设置 */}
				<BtSetting />
				{(env === 'development' || manualDev) && (
					<>
						<Text
							style={{
								color: themeColor,
								opacity: 0.6,
								marginLeft: 4,
								paddingTop: 24,
								fontSize: 14,
							}}
						>
							开发者选项
						</Text>
						<DeSetting />
					</>
				)}

				{/* 版本信息 */}
				<Pressable
					delayLongPress={2000}
					onPressIn={() => {
						pressProgress.value = 0.3;
						pressProgress.value = withTiming(1, { duration: 4000 });
					}}
					onPressOut={() => {
						cancelAnimation(pressProgress);
						pressProgress.value = withTiming(0.3, { duration: 150 });
					}}
					onLongPress={() => {
						console.log('long press version info');
						successAnimation.value = 0;
						successAnimation.value = withTiming(10, { duration: 400 }, () => {
							successAnimation.value = withTiming(0, { duration: 400 });
						});
						setManualDev(!manualDev);
					}}
				>
					<View style={{ position: 'relative' }}>
						<Animated.View style={[animatedStyle, animatedSuccessStyle]}>
							<Text
								style={{
									color: themeColor,
									textAlign: 'center',
									fontSize: 14,
									paddingVertical: 16,
								}}
							>
								Tefnut {appVersion} ({buildNumber})
								{manualDev ? ' (manualDev)' : env !== 'production' ? ` ${env} ` : ''}
							</Text>
						</Animated.View>
					</View>
				</Pressable>
			</ScrollView>

			{/* 键盘规避with animate */}
			<AvoidKeyboard />
		</SafeAreaView>
	);
}
