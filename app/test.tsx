import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import axios from "axios";
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

    const handleRefresh = async () => {
        try {
        		const refreshToken = await Utils.getRefreshToken();
        		
		    if (!refreshToken) {
		      throw new Error("Refresh token missing");
		    }
        
		    const response = await axios.post(
		      `${process.env.EXPO_PUBLIC_API_BASE_URL}/refresh`,
		      {
		        refreshToken,
		      }
		    );
		    
		    console.log(response);
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
                onPress={() => handleRefresh()}
                style={buttonStyle}
            >
                <Text style={{ color: "white", fontWeight: "600" }}>
                    Refresh
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
