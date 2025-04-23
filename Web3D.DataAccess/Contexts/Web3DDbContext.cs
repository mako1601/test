using Microsoft.EntityFrameworkCore;

using Web3D.Domain.Models;

namespace Web3D.DataAccess.Contexts;

public class Web3DDbContext(DbContextOptions<Web3DDbContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }
    public DbSet<Test> Tests { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<Article> Articles { get; set; }
    public DbSet<TestResult> TestResults { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(user =>
        {
            user.HasKey(x => x.Id);

            user.Property(x => x.Login)
                .IsRequired()
                .HasMaxLength(30);

            user.HasIndex(x => x.Login)
                .IsUnique();

            user.Property(x => x.LastName)
                .IsRequired()
                .HasMaxLength(30);

            user.Property(x => x.FirstName)
                .IsRequired()
                .HasMaxLength(30);

            user.Property(x => x.MiddleName)
                .IsRequired(false)
                .HasMaxLength(30);

            user.Property(x => x.Role)
                .HasConversion<string>()
                .HasDefaultValue(Role.Student);

            user.Property(x => x.LastActivity)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            user.HasIndex(x => x.LastActivity);
        });

        modelBuilder.Entity<Article>(article =>
        {
            article.HasKey(x => x.Id);

            article.Property(x => x.UserId)
                   .IsRequired();

            article.Property(x => x.Title)
                   .IsRequired()
                   .HasMaxLength(100);

            article.Property(x => x.Description)
                   .IsRequired(false)
                   .HasMaxLength(500);

            article.Property(x => x.ContentUrl)
                   .IsRequired()
                   .HasMaxLength(512);

            article.Property(x => x.CreatedAt)
                   .IsRequired()
                   .HasDefaultValueSql("CURRENT_TIMESTAMP");

            article.Property(x => x.UpdatedAt)
                   .IsRequired(false);

            article.HasOne<User>()
                   .WithMany()
                   .HasForeignKey(x => x.UserId)
                   .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Test>(test =>
        {
            test.HasKey(x => x.Id);

            test.Property(x => x.UserId)
                .IsRequired();

            test.Property(x => x.Title)
                .IsRequired()
                .HasMaxLength(100);

            test.Property(x => x.Description)
                .IsRequired(false)
                .HasMaxLength(500);

            test.Property(x => x.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            test.Property(x => x.UpdatedAt)
                .IsRequired(false);

            test.HasOne<User>()
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            test.HasMany(x => x.Questions)
                .WithOne()
                .HasForeignKey(x => x.TestId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Question>(question =>
        {
            question.HasKey(x => x.Id);

            question.Property(x => x.TestId)
                    .IsRequired();

            question.Property(x => x.Index)
                    .IsRequired();

            question.Property(x => x.Type)
                    .IsRequired();

            question.Property(x => x.Text)
                    .IsRequired(false)
                    .HasMaxLength(100);

            question.Property(x => x.TaskJson)
                    .IsRequired()
                    .HasColumnType("jsonb");

            question.Property(x => x.ImageUrl)
                    .IsRequired(false)
                    .HasMaxLength(512);
        });

        modelBuilder.Entity<TestResult>(testResult =>
        {
            testResult.HasKey(x => x.Id);

            testResult.HasIndex(x => new { x.UserId, x.TestId, x.Attempt })
                      .IsUnique();

            testResult.Property(x => x.UserId)
                      .IsRequired();

            testResult.Property(x => x.TestId)
                      .IsRequired();

            testResult.Property(x => x.Attempt)
                      .IsRequired();

            testResult.Property(x => x.Score)
                      .IsRequired(false);

            testResult.Property(x => x.AnswersJson)
                      .IsRequired()
                      .HasColumnType("jsonb");

            testResult.Property(x => x.StartedAt)
                      .IsRequired()
                      .HasDefaultValueSql("CURRENT_TIMESTAMP");

            testResult.Property(x => x.EndedAt)
                      .IsRequired(false);

            testResult.HasOne<User>()
                      .WithMany()
                      .HasForeignKey(x => x.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

            testResult.HasOne<Test>()
                      .WithMany()
                      .HasForeignKey(x => x.TestId)
                      .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RefreshToken>(refreshToken =>
        {
            refreshToken.HasKey(x => x.Id);

            refreshToken.Property(x => x.UserId)
                        .IsRequired();

            refreshToken.HasIndex(x => x.UserId);

            refreshToken.Property(x => x.Token)
                        .IsRequired()
                        .HasMaxLength(500);

            refreshToken.HasIndex(x => x.Token)
                        .IsUnique();

            refreshToken.Property(x => x.CreatedAt)
                        .IsRequired()
                        .HasDefaultValueSql("CURRENT_TIMESTAMP");

            refreshToken.Property(x => x.ExpiresAt)
                        .IsRequired();

            refreshToken.Property(x => x.IpAddress)
                        .IsRequired(false)
                        .HasMaxLength(45);

            refreshToken.Property(x => x.UserAgent)
                        .IsRequired(false)
                        .HasMaxLength(500);

            refreshToken.HasOne<User>()
                        .WithMany()
                        .HasForeignKey(x => x.UserId)
                        .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
