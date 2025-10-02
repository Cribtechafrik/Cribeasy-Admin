

export function validateAuthForm(data: any) {
	const errors: any = {};

    if (!data.identifier.trim()) {
        errors.identifier = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(data.identifier)) {
        errors.identifier = "Email is invalid";
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data.identifier)) {
        errors.identifier = "Email is invalid";
    }

    if (!data.password) {
        errors.password = "Password is required";
    } else if (data.password.length < 8) {
        errors.password = "Password must be at least 8 characters long";
    }

    return errors;
}