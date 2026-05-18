// src/api/auth.ts

import { apiClient } from "./client";
import * as Utils from '@/lib/utils';

export async function welcome() {

    const deviceType = await Utils.getDeviceType();
    const { agent, platform, model, deviceName } = Utils.getDeviceInfo();

    const response = await apiClient.post(`${process.env.EXPO_PUBLIC_API_ROOT}/welcome`, {
        agent, platform, model, deviceName, deviceType
    });

    return response.data;
}

export async function login(email: string, password: string) {
    const response = await apiClient.post("/auth/login", {
        email,
        password,
    });

    return response.data;
}

export async function getMe() {
    type User = {
        id: string;
        email: string;
    };

    const response = await apiClient.get<User>("/me");

    return response.data;
}