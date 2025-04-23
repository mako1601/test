export interface UserDto {
  id: number;
  lastName: string;
  firstName: string;
  middleName?: string;
  role: number;
}

export interface RegData {
  login: string;
  password: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  role: number;
};

export interface LogData {
  login: string;
  password: string;
};

export interface UpdUserData {
  lastName: string;
  firstName: string;
  middleName?: string;
}

export interface UpdUserPass {
  oldPassword: string;
  newPassword: string;
}

export interface ChangeUserRole {
  userId: number;
  newRole: number;
}