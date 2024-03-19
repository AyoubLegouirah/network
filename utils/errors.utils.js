module.exports.SignUpErrors = (err) => {
    let errors = { pseudo: "", email: "", password: "" };
    
    if (err.message.includes("pseudo"))
        errors.pseudo = "Pseudo incorrect or already taken";
    
    if (err.message.includes("email")) 
        errors.email = "Email incorrect";
    
    if (err.message.includes("password"))
        errors.password = "Password must be at least 6 characters long";
    
    if (err.code === 11000 && Object.keys(err.keyValue)[0].includes("email"))
        errors.email = "This email is already registered";

    if (err.code === 11000 && Object.keys(err.keyValue)[0].includes("pseudo"))
        errors.pseudo = "This pseudo is already registered";
    
    return errors;

};

module.exports.SignInErrors = (err) => {
    let errors = { email: "", password: "" };
    
    if (err.message.includes("email"))
        errors.email = "Email incorrect";
    
    if (err.message.includes("password"))
        errors.password = "Password incorrect";
    
    return errors;
}; 
