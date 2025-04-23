namespace Web3D.Domain.Models.Dto;

public class AnswerResultDto
{
    public long QuestionId { get; set; }
    public QuestionType Type { get; set; }
    public string UserAnswerJson { get; set; } = "{}";
}
