namespace Web3D.Domain.Exceptions;

public class RefreshTokenNotFoundException : Exception
{
    public RefreshTokenNotFoundException() : base("Refresh token not found") { }
}
