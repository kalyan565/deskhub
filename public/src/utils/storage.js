const PREFIX = "deskhub:";

export function set(key, value) {
    localStorage.setItem(
        PREFIX + key,
        JSON.stringify(value)
    );
}

export function get(key) {
    const value = localStorage.getItem(
        PREFIX + key
    );

    if (value === null) {
        return null;
    }

    return JSON.parse(value);
}

export function remove(key) {
    localStorage.removeItem(
        PREFIX + key
    );
}

export function clear() {
    Object.keys(localStorage).forEach((key) => {

        if (key.startsWith(PREFIX)) {
            localStorage.removeItem(key);
        }

    });
}