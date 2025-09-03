import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BookOpen, Sprout, MapPin, CheckSquare, Plus } from 'lucide-react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/Colors';

const NewTabBar = ({ state, descriptors, navigation }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const desiredOrder = ['journal/index', 'plants', 'add/index', 'beds/index', 'tasks'];
  const orderedRoutes = desiredOrder.map(routeName =>
    state.routes.find(route => route.name === routeName)
  ).filter(Boolean);

  return (
    <View style={[styles.tabBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
      {orderedRoutes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const getIcon = (routeName) => {
            const iconColor = isFocused ? colors.primary : colors.tabIconDefault;
            switch (routeName) {
                case 'journal/index':
                    return <BookOpen color={iconColor} />;
                case 'plants':
                    return <Sprout color={iconColor} />;
                case 'add/index':
                    return (
                        <View style={[styles.addButton, { backgroundColor: colors.primary }]}>
                            <Plus color={colors.primaryForeground} />
                        </View>
                    );
                case 'beds/index':
                    return <MapPin color={iconColor} />;
                case 'tasks':
                    return <CheckSquare color={iconColor} />;
                default:
                    return null;
            }
        }

        if (route.name === 'add/index') {
            return (
                <TouchableOpacity
                    key={route.key}
                    accessibilityRole="button"
                    accessibilityState={isFocused ? { selected: true } : {}}
                    accessibilityLabel={options.tabBarAccessibilityLabel}
                    testID={options.tabBarTestID}
                    onPress={onPress}
                    onLongPress={onLongPress}
                    style={styles.addButtonContainer}
                >
                    {getIcon(route.name)}
                    <Text style={{ color: isFocused ? colors.primary : colors.tabIconDefault, fontSize: 12 }}>
                        Add
                    </Text>
                </TouchableOpacity>
            )
        }


        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
          >
            {getIcon(route.name)}
            <Text style={{ color: isFocused ? colors.primary : colors.tabIconDefault, fontSize: 12 }}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: 80,
    borderTopWidth: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: -20,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default NewTabBar;
