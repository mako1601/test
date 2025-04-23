namespace Web3D.Domain.Filters;

public class Filter
{
    public string? SearchText { get; set; }
    public ICollection<long>? UserId { get; set; }
    public ICollection<long>? TestId { get; set; }
}
