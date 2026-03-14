const validateUserRegistration = (data) => {
    const errors = [];

    //validating utorid
    if (!data.utorid || typeof data.utorid !== 'string') {
        errors.push("utorid is required and must be a string.");
    } else if (!/^[a-zA-Z0-9]{7,8}$/.test(data.utorid)) {
        errors.push("utorid must be 7 or 8 alphanumeric characters.");
    }
    //validate email
    if (!data.email || typeof data.email !== 'string') {
        errors.push("email is required and must be a string.");
    } else if (!/^[^\s@]+@(mail\.utoronto\.ca|gmail\.com)$/.test(data.email)) {
        errors.push("email must be a valid University of Toronto or Gmail address.");
    }

    //validate name
    if (!data.name || typeof data.name !== 'string') {
        errors.push("name is required and must be a string.");
    } else if (data.name.length < 1 || data.name.length > 50) {
        errors.push("name must be between 1 and 50 characters long.");
    }

    return errors;
};

const validateRole = (role) => {
    const validRoles = ['regular', 'cashier', 'manager', 'superuser'];
    return validRoles.includes(role);
}

module.exports = {
    validateUserRegistration,
    validateRole
};
