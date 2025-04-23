namespace Web3D.Domain.Options;

public class AuthOptions
{
    public TimeSpan Expires { get; set; }
    public string SecretKey { get; set; } = string.Empty;
}
