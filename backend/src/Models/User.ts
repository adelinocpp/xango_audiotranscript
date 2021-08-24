// ----------------------------------------------------------------------------
interface pgInterfaceUser {
    // --- Controle basico de acesso de usuario
    id: number
    user_name?: string
    email?: string 
    created?: Date
    updated?: Date
    completed?: Date
};
// ----------------------------------------------------------------------------
export {pgInterfaceUser};
// ----------------------------------------------------------------------------