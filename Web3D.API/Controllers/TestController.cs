using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

using Web3D.API.Requests;
using Web3D.Domain.Filters;
using Web3D.Domain.Exceptions;
using Web3D.BusinessLogic.Abstractions;

namespace Web3D.API.Controllers;

[ApiController]
[Route("api/tests")]
public class TestController(ITestService testService) : ControllerBase
{
    [HttpPost]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> CreateAsync([FromBody] TestRequest request)
    {
        var authorId = Convert.ToInt64(User.Claims.FirstOrDefault(x => x.Type == "id")?.Value);
        await testService.CreateAsync(authorId, request.Title, request.Description, request.Questions);
        return NoContent();
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetAsync([FromRoute] long id)
    {
        var result = await testService.GetByIdAsync(id);
        return Ok(result);
    }

    [HttpGet("{id:long}/pass")]
    public async Task<IActionResult> GetForPassingAsync([FromRoute] long id)
    {
        var result = await testService.GetForPassingByIdAsync(id);
        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllAsync([FromQuery] Filter filter, [FromQuery] SortParams sortParams, [FromQuery] PageParams pageParams)
    {
        var result = await testService.GetAllAsync(filter, sortParams, pageParams);
        return Ok(result);
    }

    [HttpPut("{testId:long}")]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> UpdateAsync([FromRoute] long testId, [FromBody] TestRequest request)
    {
        await testService.UpdateAsync(testId, request.Title, request.Description, request.Questions);
        return NoContent();
    }

    [HttpDelete("{testId:long}")]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> DeleteAsync([FromRoute] long testId)
    {
        await testService.DeleteAsync(testId);
        return NoContent();
    }

    [HttpGet("{testId:long}/start")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> StartTestAsync([FromRoute] long testId)
    {
        try
        {
            var userId = Convert.ToInt64(User.Claims.FirstOrDefault(x => x.Type == "id")?.Value);
            var result = await testService.StartTestAsync(testId, userId);
            return Ok(result);
        }
        catch (UserNotFoundException)
        {
            return NotFound("Пользователь не найден");
        }
        catch (TestNotFoundException)
        {
            return NotFound("Тест не найден");
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Ошибка на сервере: " + ex.Message);
        }
    }

    [HttpPut("{testResultId:long}/finish")]
    [Authorize]
    public async Task<IActionResult> FinishTestAsync([FromRoute] long testResultId, [FromBody] AnswerRequest request)
    {
        try
        {
            await testService.FinishTestAsync(testResultId, request.AnswerResults);
            return NoContent();
        }
        catch (TestNotFoundException)
        {
            return NotFound("Тест не найден");
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Ошибка на сервере: " + ex.Message);
        }
    }

    [HttpGet("{testResultId:long}/result")]
    [Authorize]
    public async Task<IActionResult> GetTestResultAsync([FromRoute] long testResultId)
    {
        var result = await testService.GetTestResultByIdAsync(testResultId);
        return Ok(result);
    }

    [HttpGet("results")]
    public async Task<IActionResult> GetAllTestResultsAsync([FromQuery] Filter filter, [FromQuery] SortParams sortParams, [FromQuery] PageParams pageParams)
    {
        var result = await testService.GetAllTestResultsAsync(filter, sortParams, pageParams);
        return Ok(result);
    }
}
