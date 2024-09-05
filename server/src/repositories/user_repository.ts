import { AppDataSource } from "../services/database_service";
import { UserRole } from "../enums/user_role";
import { User } from "../models/user";

export const getUserById = async (userId: number): Promise<User | null> => {
    return await AppDataSource.getRepository(User).findOne({ where: { id: userId } });
};

export const getUserByName = async (name: string): Promise<User | null> => {
    return await AppDataSource.getRepository(User).findOne({ where: { name } });
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
    return await AppDataSource.getRepository(User).findOne({ where: { email } });
};

export const createUser = async (name: string, email: string, password: string): Promise<User> => {
    const userRepo = AppDataSource.getRepository(User);
    const newUser = userRepo.create({ name, email, password });
    return await userRepo.save(newUser);
};

export const activateUser = async (userId: number): Promise<User | null> => {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) return null;

    user.activated = true;
    return await userRepo.save(user);
};

export const deleteUser = async (userId: number): Promise<void> => {
    const userRepo = AppDataSource.getRepository(User);
    await userRepo.delete({ id: userId });
};

export const changeUserRole = async (userId: number, role: UserRole): Promise<User | null> => {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) return null;

    user.role = role;
    return await userRepo.save(user);
};
