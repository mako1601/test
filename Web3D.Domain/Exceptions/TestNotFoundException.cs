namespace Web3D.Domain.Exceptions;

public class TestNotFoundException : Exception
{
    public TestNotFoundException() : base("Test not found") { }
}
