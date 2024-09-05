import { Static, Type } from "@sinclair/typebox";

//////////////////// Schemas for POST requests ////////////////////

// Schema for user registration
export const RegisterUserBody = Type.Object({
    name: Type.String({ description: "Name of the user." }),
    email: Type.String({ description: "Email address of the user." }),
    password: Type.String({ description: "Password for the user's account." })
}, {
    description: "Object containing information for registering a new user."
});
export type TRegisterUserBody = Static<typeof RegisterUserBody>;

export const RegisterUserResponse = Type.Object({
    id: Type.Number({ description: "Id of the newly registered user." }),
    name: Type.String({ description: "Name of the newly registered user." }),
    email: Type.String({ description: "Email address of the newly registered user." }),
    role: Type.String({ description: "Role of the newly registered user." })
}, {
    description: "Response containing details of the newly registered user."
});
export type TRegisterUserResponse = Static<typeof RegisterUserResponse>;

// Schema for user login
export const LoginUserBody = Type.Object({
    name: Type.String({ description: "Name of the user." }),
    password: Type.String({ description: "Password for the user's account." })
}, {
    description: "Object containing credentials for user login."
});
export type TLoginUserBody = Static<typeof LoginUserBody>;

export const LoginUserResponse = Type.Object({
    id: Type.Number({ description: "Id of the logged-in user." }),
    name: Type.String({ description: "Name of the logged-in user." }),
    email: Type.String({ description: "Email address of the logged-in user." }),
    role: Type.String({ description: "Role of the logged-in user." })
}, {
    description: "Response containing details of the logged-in user."
});
export type TLoginUserResponse = Static<typeof LoginUserResponse>;


//////////////////// Schemas for PUT requests ////////////////////

// Schema for activating a user
export const ActivateUserParams = Type.Object({
    userId: Type.Number({ description: "ID of the user to activate." }),
});
export type TActivateUserParams = Static<typeof ActivateUserParams>;

export const ActivateUserBody = Type.Object({
    loggedUserId: Type.Number({ description: "ID of logged user that made request." })
})
export type TActivateUserBody = Static<typeof ActivateUserBody>;

export const ActivateUserResponse = Type.Object({
    id: Type.Number({ description: "Id of the activated user." }),
    name: Type.String({ description: "Name of the activated user." }),
    email: Type.String({ description: "Email address of the activated user." }),
    role: Type.String({ description: "Role of the logged-in user." })
}, {
    description: "Response containing details of the activated user."
});
export type TActivateUserResponse = Static<typeof ActivateUserResponse>;


// Schema for changing user role
export const ChangeUserRoleParams = Type.Object({
    userId: Type.Number({ description: "ID of the user whose role is to be changed." })
});
export type TChangeUserRoleParams = Static<typeof ChangeUserRoleParams>;

export const ChangeUserRoleBody = Type.Object({
    role: Type.String({ description: "New role for the user." }),
    loggedUserId: Type.Number({ description: "ID of logged user that made request." })
}, {
    description: "Object containing the new role for the user."
});
export type TChangeUserRoleBody = Static<typeof ChangeUserRoleBody>;

export const ChangeUserRoleResponse = Type.Object({
    id: Type.Number({ description: "Id of the user whose role was changed." }),
    name: Type.String({ description: "Name of the user whose role was changed." }),
    email: Type.String({ description: "Email address of the user whose role was changed." }),
    role: Type.String({ description: "New role of the user." })
}, {
    description: "Response containing details of the user with the updated role."
});
export type TChangeUserRoleResponse = Static<typeof ChangeUserRoleResponse>;


//////////////////// Schemas for DELETE requests ////////////////////

// Schema for deleting a user
export const DeleteUserParams = Type.Object({
    userId: Type.Number({ description: "ID of the user to delete." })
});
export type TDeleteUserParams = Static<typeof DeleteUserParams>;

export const DeleteUserBody = Type.Object({
    loggedUserId: Type.Number({ description: "ID of logged user that made request." })
});
export type TDeleteUserBody = Static<typeof DeleteUserBody>;

export const DeleteUserResponse = Type.Null({
    description: "User successfully deleted"
});
export type TDeleteUserResponse = Static<typeof DeleteUserResponse>;

//////////////////// Schemas for errors ////////////////////

// Schema for user not found error
export const ErrorWithMessage = Type.Object({
    errorMessage: Type.String({
        description: "Reason of error that occured."
    })
}, {
    description: "Error indicating that something was not right."
});
export type TErrorWithMessage = Static<typeof ErrorWithMessage>;
