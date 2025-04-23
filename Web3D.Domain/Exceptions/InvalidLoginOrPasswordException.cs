namespace Web3D.Domain.Exceptions;

public class InvalidLoginOrPasswordException : Exception
{
    public InvalidLoginOrPasswordException() : base("Invalid login or password") { }
}
