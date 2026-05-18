import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Utils from "@/lib/utils";
import { welcome, getMe } from "../api/auth";

const TestPage: React.FC = () => {

    // Init
    useEffect(() => {
        const init = async () => {

        };

        init();
    }, []);

    const handleMe = async () => {
        try {
            const data = await getMe();
            console.log(data);
        } catch (error) {
            console.log(error);
        }
    }

    const handleClearTokens = async () => {
        await Utils.deleteTokens();
    }

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>

            <Pressable
                onPress={() => handleMe()}
                style={buttonStyle}
            >
                <Text style={{ color: "white", fontWeight: "600" }}>
                    Me
                </Text>
            </Pressable>

            <Pressable
                onPress={() => handleClearTokens()}
                style={buttonStyle}
            >
                <Text style={{ color: "white", fontWeight: "600" }}>
                    Clear tokens
                </Text>
            </Pressable>

        </View>
    );
};

const buttonStyle = {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    width: 200,
    alignItems: "center" as const,
};

export default TestPage;
