import React from 'react';
import {
    Pressable,
    Text,
    View,
    StyleSheet,
    ActivityIndicator,
    PressableStateCallbackType,
} from 'react-native';
import { Hotspot, Category } from '@/lib/hotspot'

type Props = {
    hotspot: Hotspot
};

export const HotspotPage: React.FC<Props> = ({
    hotspot
}) => {
    return (
        <View style={{ height: 230, backgroundColor: 'lightgray', borderBottomWidth: 1, borderBottomColor: 'lightgray' }}>
            {/* Name */}
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>{hotspot.name}</Text>
        </View>
    );
};
