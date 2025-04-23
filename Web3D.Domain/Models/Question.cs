namespace Web3D.Domain.Models;

public class Question
{
    public long Id { get; set; }
    public long TestId { get; set; }
    public int Index { get; set; }
    public QuestionType Type { get; set; }
    public string? Text { get; set; }
    public string TaskJson { get; set; } = "{}";
    public string? ImageUrl { get; set; }
}
