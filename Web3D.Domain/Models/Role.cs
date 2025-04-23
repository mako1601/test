namespace Web3D.Domain.Models;

public enum Role
{
    Admin = 0,
    Student = 1,
    Teacher = 2
}

public static class Converter
{
    public static Role ConvertStringToRole(string? role)
    {
        return role switch
        {
            "Admin" => Role.Admin,
            "Student" => Role.Student,
            "Teacher" => Role.Teacher,
            _ => Role.Student
        };
    }
}