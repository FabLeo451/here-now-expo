import React from 'react';
import {
    Pressable,
    Text,
    View,
    StyleSheet,
    ActivityIndicator,
    PressableStateCallbackType,
} from 'react-native';

type AppButtonProps = {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    style?: PressableStateCallbackType | any;
};

export const AppButton: React.FC<AppButtonProps> = ({
    title,
    onPress,
    disabled = false,
    loading = false,
    icon,
    style,
}) => {
    return (
        <Pressable
            disabled={disabled || loading}
            onPress={onPress}
            style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
                disabled && styles.disabled,
                style,
            ]}
        >
            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        {icon && <View style={styles.icon}>{icon}</View>}
                        <Text style={styles.text}>{title}</Text>
                    </>
                )}
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pressed: {
        backgroundColor: '#0056b3',
    },
    disabled: {
        opacity: 0.5,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 6,
    },
    text: {
        color: '#fff',
        fontWeight: '500',
    },
});
