namespace Web3D.Domain.Exceptions;

public class LoginAlreadyTakenException : Exception
{
    public LoginAlreadyTakenException() : base("Login is already taken") { }
}
