namespace Web3D.Domain.Models;

public class TestResult
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public long TestId { get; set; }
    public long Attempt { get; set; }
    public double? Score { get; set; }
    public string AnswersJson { get; set; } = "[]";
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
}
