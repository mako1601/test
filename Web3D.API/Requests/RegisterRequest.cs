namespace Web3D.API.Requests;
public record RegisterRequest(string Login, string Password, string LastName, string FirstName, string? MiddleName, Domain.Models.Role Role);