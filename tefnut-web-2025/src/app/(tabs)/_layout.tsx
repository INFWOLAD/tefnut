import { Platform } from 'react-native';
import { useColor } from '@/hooks/useColor';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
export default function TabsLayout() {
	const red = useColor('red');
	const primary = useColor('primary');
	const tabBackground = useColor('background');
	const foreground = useColor('foreground');
	const selected = useColor('card');

	return (
		<NativeTabs
			minimizeBehavior="onScrollDown"
			labelStyle={{
				default: { color: primary },
				selected: { color: foreground },
			}}
			iconColor={{
				default: primary,
				selected: foreground,
			}}
			badgeBackgroundColor={red}
			backgroundColor={Platform.select({
				android: tabBackground,
			})}
			indicatorColor={selected}
			labelVisibilityMode="selected"
			disableTransparentOnScrollEdge={true}
		>
			<NativeTabs.Trigger name="(home)">
				{Platform.select({
					ios: <NativeTabs.Trigger.Icon sf="house.fill" />,
					android: (
						<NativeTabs.Trigger.Icon
							src={<NativeTabs.Trigger.VectorIcon family={FontAwesome6} name="house-chimney" />}
						/>
					),
				})}
				<NativeTabs.Trigger.Label>首页</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>

			<NativeTabs.Trigger name="settings">
				{Platform.select({
					ios: <NativeTabs.Trigger.Icon sf="gear" />,
					android: (
						<NativeTabs.Trigger.Icon
							src={<NativeTabs.Trigger.VectorIcon family={FontAwesome6} name="user-gear" />}
						/>
					),
				})}
				<NativeTabs.Trigger.Label>设置</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>

			{/* <NativeTabs.Trigger
        name="search"
        role={isLiquidGlassAvailable() ? "search" : undefined}
      >
        {Platform.select({
          ios: <Icon sf="magnifyingglass" />,
          android: (
            <Icon src={<VectorIcon family={MaterialIcons} name="search" />} />
          ),
        })}
        <Label>Search</Label>
      </NativeTabs.Trigger> */}
		</NativeTabs>
	);
}
