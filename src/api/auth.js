import { get } from "./client.js";
import { set, get as getStorage, remove } from "../utils/storage.js";

export async function login(email, password) {

    const users = await get(
        `/users?email=${email}`
    );

    const user = users[0];

    if (
        !user ||
        user.password !== password
    ) {
        throw new Error(
            "Invalid email or password"
        );
    }

    const token =
        "token-" + Date.now();

    set("token", token);
    set("user", user);

    return user;
}

export function logout() {
    remove("token");
    remove("user");
}

export function getCurrentUser() {
    return getStorage("user");
}

export function isAuthenticated() {
    return !!getStorage("token");
}