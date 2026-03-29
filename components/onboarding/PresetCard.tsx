import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated, Image, ImageSourcePropType } from 'react-native';

interface PresetCardProps {
  name: string;
  description?: string;
  color: string;
  image?: ImageSourcePropType;
  selected: boolean;
  onPress: () => void;
}

export function PresetCard({ name, description, color, image, selected, onPress }: PresetCardProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: selected ? 1.04 : 1,
      useNativeDriver: true,
      tension: 80,
      friction: 8,
    }).start();
  }, [selected, scaleAnim]);

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[styles.card, selected && styles.cardSelected]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {image ? (
          <Image source={image} style={styles.colorBlock} resizeMode="cover" />
        ) : (
          <View style={[styles.colorBlock, { backgroundColor: color }]} />
        )}
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '48%',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#2A2A2A',
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: '#C8A84B',
  },
  colorBlock: {
    width: '100%',
    height: 80,
  },
  info: {
    padding: 10,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    color: '#888888',
    fontSize: 12,
    lineHeight: 16,
  },
});
