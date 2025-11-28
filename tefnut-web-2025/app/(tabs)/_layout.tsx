import { Platform } from "react-native";
import { useColor } from "@/hooks/useColor";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabsLayout() {
  const red = useColor("red");
  const primary = useColor("primary");
  const tabBackground = useColor("background");
  const foreground = useColor("foreground");
  const selected = useColor("card");

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
          ios: <Icon sf="house.fill" />,
          android: <Icon src={require("@/assets/icons/house.png")} />,
        })}
        <Label>首页</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        {Platform.select({
          ios: <Icon sf="gear" />,
          android: <Icon src={require("@/assets/icons/cog.png")} />,
        })}
        <Label>设置</Label>
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
