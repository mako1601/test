using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

using Web3D.API.Requests;
using Web3D.Domain.Models;
using Web3D.Domain.Models.Dto;
using Web3D.Domain.Exceptions;
using Web3D.BusinessLogic.Abstractions;

namespace Web3D.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IUserService userService, ITokenService tokenService) : ControllerBase
{
    [HttpGet("me")]
    public IActionResult GetCurrentUser()
    {
        try
        {
            var user = new UserDto
            {
                Id = Convert.ToInt64(User.Claims.FirstOrDefault(x => x.Type == "id").Value),
                LastName = User.Claims.FirstOrDefault(x => x.Type == "lastName").Value,
                FirstName = User.Claims.FirstOrDefault(x => x.Type == "firstName").Value,
                MiddleName = User.Claims.FirstOrDefault(x => x.Type == "middleName").Value,
                Role = Converter.ConvertStringToRole(User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Role).Value)
            };
            return Ok(user);
        }
        catch (NullReferenceException)
        {
            return Ok(null);
        }
    }

    [HttpPost("register")]
    public async Task<IActionResult> RegisterAsync([FromBody] RegisterRequest request)
    {
        try
        {
            var (accessToken, refreshToken) = await userService.RegisterAsync(request.Login, request.Password, request.LastName, request.FirstName, request.MiddleName, request.Role);

            Response.Cookies.Append("accessToken", accessToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddMinutes(10),
            });
            Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(7),
            });

            return NoContent();
        }
        catch (LoginAlreadyTakenException)
        {
            return Conflict("Логин уже занят");
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Ошибка на сервере: " + ex.Message);
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> LoginAsync([FromBody] LoginRequest request)
    {
        try
        {
            var (accessToken, refreshToken) = await userService.LoginAsync(request.Login, request.Password);

            Response.Cookies.Append("accessToken", accessToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddMinutes(10),
            });
            Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(7),
            });

            return NoContent();
        }
        catch (InvalidLoginOrPasswordException)
        {
            return NotFound("Неверный логин или пароль");
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Ошибка на сервере: " + ex.Message);
        }
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> LogoutAsync()
    {
        try
        {
            var token = Request.Cookies["refreshToken"];
            if (token == null) return NotFound("Refresh token not found");

            Response.Cookies.Delete("accessToken");
            Response.Cookies.Delete("refreshToken");

            await tokenService.DeleteAsync(token);

            return NoContent();
        }
        catch (RefreshTokenNotFoundException)
        {
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Ошибка на сервере: " + ex.Message);
        }
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshAccessToken()
    {
        try
        {
            var token = Request.Cookies["refreshToken"];
            if (token == null) return Unauthorized("Refresh token not found in Cookies");

            var refreshToken = await tokenService.UpdateByTokenAsync(token);
            if (refreshToken == null) return Unauthorized("Refresh token not found on Server");

            var newAccessToken = await userService.RefreshAccessTokenAsync(refreshToken.UserId);
            if (newAccessToken == null) return Unauthorized("Access token was not generated");

            Response.Cookies.Append("accessToken", newAccessToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddMinutes(10),
            });
            Response.Cookies.Append("refreshToken", refreshToken.Token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(7),
            });

            return NoContent();
        }
        catch (RefreshTokenNotFoundException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Ошибка на сервере: " + ex.Message);
        }
    }
}
