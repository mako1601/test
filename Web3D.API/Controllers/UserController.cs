using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

using Web3D.API.Requests;
using Web3D.Domain.Filters;
using Web3D.Domain.Exceptions;
using Web3D.BusinessLogic.Abstractions;

namespace Web3D.API.Controllers;

[ApiController]
[Route("api/users")]
public class UserController(IUserService userService) : ControllerBase
{
    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetAsync([FromRoute] long id)
    {
        var result = await userService.GetByIdAsync(id);
        return Ok(result);
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllAsync([FromQuery] Filter filter, [FromQuery] PageParams page, [FromQuery] SortParams order)
    {
        var result = await userService.GetAllAsync(filter, order, page);
        return Ok(result);
    }

    [HttpPut]
    [Authorize]
    public async Task<IActionResult> UpdateAsync([FromBody] UpdateUserNameRequest request)
    {
        var id = Convert.ToInt64(User.Claims.FirstOrDefault(x => x.Type == "id")?.Value);
        await userService.UpdateAsync(id, request.LastName, request.FirstName, request.MiddleName);
        return NoContent();
    }

    [HttpPut("update-password")]
    [Authorize]
    public async Task<IActionResult> UpdatePasswordAsync([FromBody] UpdatePasswordRequest request)
    {
        try
        {
            var id = Convert.ToInt64(User.Claims.FirstOrDefault(x => x.Type == "id")?.Value);
            await userService.UpdatePasswordAsync(id, request.OldPassword, request.NewPassword);
            return NoContent();
        }
        catch (UserNotFoundException)
        {
            return NotFound("Пользователь не найден");
        }
        catch (InvalidLoginOrPasswordException)
        {
            return NotFound("Не верный пароль");
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Ошибка на сервере: " + ex.Message);
        }
    }

    [HttpPut("change-role")]
    [Authorize]
    public async Task<IActionResult> ChangeRoleAsync([FromBody] ChangeRoleRequest request)
    {
        try
        {
            var callerId = Convert.ToInt64(User.Claims.FirstOrDefault(x => x.Type == "id")?.Value);
            await userService.UpdateRoleAsync(callerId, request.UserId, request.NewRole);
            return NoContent();
        }
        catch (UserNotFoundException)
        {
            return NotFound("Пользователь не найден");
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Ошибка на сервере: " + ex.Message);
        }
    }
}
