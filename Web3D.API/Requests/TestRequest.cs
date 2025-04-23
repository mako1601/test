namespace Web3D.API.Requests;
public record TestRequest(string Title, string Description, ICollection<Domain.Models.Question> Questions);