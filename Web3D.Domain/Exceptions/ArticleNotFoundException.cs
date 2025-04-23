namespace Web3D.Domain.Exceptions;

public class ArticleNotFoundException : Exception
{
    public ArticleNotFoundException() : base("Article not found") { }
}
