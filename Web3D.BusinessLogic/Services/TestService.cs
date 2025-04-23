using System.Text.Json;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

using Web3D.Domain.Models;
using Web3D.Domain.Filters;
using Web3D.Domain.Models.Dto;
using Web3D.Domain.Exceptions;
using Web3D.DataAccess.Abstractions;
using Web3D.BusinessLogic.Abstractions;

namespace Web3D.BusinessLogic.Services;

internal class TestService(
    IUserRepository userRepository,
    ITestRepository testRepository,
    ITestResultRepository testResultRepository)
    : ITestService
{
    public async Task CreateAsync(
        long userId,
        string title,
        string description,
        ICollection<Question> questions,
        CancellationToken cancellationToken = default)
    {
        var test = new Test
        {
            UserId = userId,
            Title = title,
            Description = description,
            Questions = questions,
            CreatedAt = DateTime.UtcNow
        };

        await testRepository.CreateAsync(test, cancellationToken);
    }

    public async Task<Test?> GetByIdAsync(long testId, CancellationToken cancellationToken = default)
    {
        var test = await testRepository.GetByIdAsync(testId, cancellationToken)
            ?? throw new TestNotFoundException();
        return test;
    }

    public async Task<Test?> GetForPassingByIdAsync(long testId, CancellationToken cancellationToken = default)
    {
        var test = await testRepository.GetByIdAsync(testId, cancellationToken)
            ?? throw new TestNotFoundException();

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };

        var rng = new Random();

        foreach (var question in test.Questions)
        {
            try
            {
                using var doc = JsonDocument.Parse(question.TaskJson);
                var root = doc.RootElement;

                switch (question.Type)
                {
                    case QuestionType.SingleChoice:
                    case QuestionType.MultipleChoice:
                        {
                            var optionsArray = root.GetProperty("options").EnumerateArray().Select(x => x.GetString() ?? "").ToArray();
                            var falseAnswers = optionsArray.Select(_ => false).ToArray();

                            var modified = new Dictionary<string, object>
                            {
                                ["options"] = optionsArray,
                                ["answer"] = falseAnswers
                            };

                            question.TaskJson = System.Text.Json.JsonSerializer.Serialize(modified, options);
                            break;
                        }

                    case QuestionType.Matching:
                        {
                            var answerPairs = root.GetProperty("answer")
                                .EnumerateArray()
                                .Select(x => x.EnumerateArray().Select(x => x.GetString() ?? "").ToArray())
                                .ToList();

                            var rightParts = answerPairs.Select(x => x[1]).OrderBy(_ => rng.Next()).ToList();
                            var shuffledPairs = answerPairs.Select((pair, index) => new[] { pair[0], rightParts[index] }).ToList();

                            var modified = new Dictionary<string, object>
                            {
                                ["answer"] = shuffledPairs
                            };

                            question.TaskJson = System.Text.Json.JsonSerializer.Serialize(modified, options);
                            break;
                        }

                    case QuestionType.FillInTheBlank:
                        {
                            var modified = new Dictionary<string, object>
                            {
                                ["answer"] = ""
                            };

                            question.TaskJson = System.Text.Json.JsonSerializer.Serialize(modified, options);
                            break;
                        }
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Ошибка обработки JSON у вопроса ID {question.Id}: {ex.Message}");
            }
        }

        return test;
    }

    public async Task<PageResult<Test>> GetAllAsync(
        Filter filter,
        SortParams sortParams,
        PageParams pageParams,
        CancellationToken cancellationToken = default)
    {
        var tests = await testRepository.GetAllAsync(filter, sortParams, pageParams, cancellationToken);
        return tests;
    }

    public async Task UpdateAsync(
        long testId,
        string newTitle,
        string newDescription,
        ICollection<Question> questions,
        CancellationToken cancellationToken = default)
    {
        var test = await testRepository.GetByIdAsync(testId, cancellationToken)
            ?? throw new TestNotFoundException();

        test.Title = newTitle;
        test.Description = newDescription;
        test.Questions = questions;
        test.UpdatedAt = DateTime.UtcNow;

        await testRepository.UpdateAsync(test, cancellationToken);
    }

    public async Task DeleteAsync(long testId, CancellationToken cancellationToken = default)
    {
        var test = await testRepository.GetByIdAsync(testId, cancellationToken)
            ?? throw new TestNotFoundException();
        await testRepository.DeleteAsync(test, cancellationToken);
    }

    public async Task<long> StartTestAsync(long testId, long userId, CancellationToken cancellationToken = default)
    {
        _ = await testRepository.GetByIdAsync(testId, cancellationToken) ?? throw new TestNotFoundException();
        _ = await userRepository.GetByIdAsync(userId, cancellationToken) ?? throw new UserNotFoundException();
        var attempt = await testResultRepository.GetAttemptAsync(testId, userId, cancellationToken);

        var testResult = new TestResult
        {
            UserId = userId,
            TestId = testId,
            Attempt = attempt,
            StartedAt = DateTime.UtcNow
        };

        var testResultId = await testResultRepository.StartTestAsync(testResult, cancellationToken);
        return testResultId;
    }

    public async Task FinishTestAsync(long testResultId, ICollection<AnswerResultDto> answerResults, CancellationToken cancellationToken = default)
    {
        var testResult = await testResultRepository.GetTestResultByIdAsync(testResultId, cancellationToken)
            ?? throw new Exception("TestResult was not found");
        var test = await testRepository.GetByIdAsync(testResult.TestId, cancellationToken)
            ?? throw new TestNotFoundException();

        testResult.EndedAt = DateTime.UtcNow;

        var answersList = new List<object>();
        int correctAnswersCount = 0;

        foreach (var answerResult in answerResults)
        {
            var question = test.Questions.FirstOrDefault(q => q.Id == answerResult.QuestionId);
            if (question == null) continue;

            var taskObject = JObject.Parse(question.TaskJson);
            var userAnswerObject = JObject.Parse(answerResult.UserAnswerJson);

            var taskAnswer = taskObject["answer"];
            var userAnswer = userAnswerObject["answer"];

            bool isCorrect;

            if (taskAnswer is JValue taskVal && userAnswer is JValue userVal && taskVal.Type == JTokenType.String && userVal.Type == JTokenType.String)
            {
                var taskStr = taskVal.ToString().ToLowerInvariant();
                var userStr = userVal.ToString().ToLowerInvariant();
                isCorrect = taskStr.Equals(userStr);
            }
            else
            {
                isCorrect = JToken.DeepEquals(taskAnswer, userAnswer);
            }

            answersList.Add(new
            {
                questionId = answerResult.QuestionId,
                type = question.Type,
                userAnswerJson = answerResult.UserAnswerJson,
                isCorrect
            });

            if (isCorrect)
            {
                correctAnswersCount++;
            }
        }

        testResult.AnswersJson = JsonConvert.SerializeObject(answersList);
        testResult.Score = (double)correctAnswersCount / test.Questions.Count * 100;

        await testResultRepository.UpdateAsync(testResult, cancellationToken);
    }

    public async Task<TestResult?> GetTestResultByIdAsync(
        long testResultId,
        CancellationToken cancellationToken = default)
    {
        var testResult = await testResultRepository.GetTestResultByIdAsync(testResultId, cancellationToken)
            ?? throw new Exception("TestResult was not found");
        return testResult;
    }

    public async Task<PageResult<TestResult>> GetAllTestResultsAsync(
        Filter filter,
        SortParams sortParams,
        PageParams pageParams,
        CancellationToken cancellationToken = default)
    {
        var testResults = await testResultRepository.GetAllAsync(filter, sortParams, pageParams, cancellationToken);
        return testResults;
    }
}
