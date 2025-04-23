using System.Text;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Web3D.API.Controllers;

[ApiController]
[Route("api/cloudinary")]
[Authorize]
public class CloudinaryController(Cloudinary cloudinary) : ControllerBase
{
    [HttpPost("upload-image")]
    public async Task<IActionResult> UploadImage([FromForm] IFormFile file)
    {
        try
        {
            using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream)
            };

            var uploadResult = await cloudinary.UploadAsync(uploadParams);

            if (uploadResult.StatusCode == System.Net.HttpStatusCode.OK)
            {
                return Ok(new { url = uploadResult.SecureUrl.ToString() });
            }
            else
            {
                return StatusCode(500, "Ошибка загрузки изображения");
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Ошибка на сервере: " + ex.Message);
        }
    }

    [HttpDelete("delete-image/{id}")]
    public async Task<IActionResult> DeleteImage([FromRoute] string id)
    {
        try
        {
            var deleteParams = new DeletionParams(id);
            var deleteResult = await cloudinary.DestroyAsync(deleteParams);

            if (deleteResult.StatusCode == System.Net.HttpStatusCode.OK)
            {
                return NoContent();
            }
            else
            {
                return StatusCode(500, "Ошибка удаления изображения");
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Ошибка на сервере: " + ex.Message);
        }
    }

    [HttpPost("upload-json")]
    public async Task<IActionResult> UploadJson([FromBody] object json)
    {
        try
        {
            string jsonContent = System.Text.Json.JsonSerializer.Serialize(json);
            var jsonBytes = Encoding.UTF8.GetBytes(jsonContent);
            using var stream = new MemoryStream(jsonBytes);

            var uploadParams = new RawUploadParams
            {
                File = new FileDescription("data.json", stream)
            };

            var uploadResult = await cloudinary.UploadAsync(uploadParams);
            if (uploadResult.StatusCode == System.Net.HttpStatusCode.OK)
            {
                return Ok(new { url = uploadResult.SecureUrl.ToString() });
            }
            else
            {
                return StatusCode(500, "Ошибка загрузки JSON");
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Ошибка на сервере: " + ex.Message);
        }
    }

    [HttpPut("update-json")]
    public async Task<IActionResult> UpdateJson([FromQuery] string id, [FromBody] object json)
    {
        try
        {
            string jsonContent = System.Text.Json.JsonSerializer.Serialize(json);
            var jsonBytes = Encoding.UTF8.GetBytes(jsonContent);
            using var stream = new MemoryStream(jsonBytes);

            var uploadParams = new RawUploadParams
            {
                File = new FileDescription("data.json", stream),
                PublicId = id,
                Overwrite = true
            };

            var uploadResult = await cloudinary.UploadAsync(uploadParams);
            if (uploadResult.StatusCode == System.Net.HttpStatusCode.OK)
            {
                return Ok(new { url = uploadResult.SecureUrl.ToString() });
            }
            else
            {
                return StatusCode(500, "Ошибка обновления JSON");
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Ошибка на сервере: " + ex.Message);
        }
    }

    [HttpDelete("delete-json")]
    public async Task<IActionResult> DeleteJson([FromQuery] string id)
    {
        try
        {
            var deleteParams = new DeletionParams(id);
            var result = await cloudinary.DestroyAsync(deleteParams);

            if (result.Result.Equals("ok"))
            {
                return NoContent();
            }
            else
            {
                return StatusCode(500, "Ошибка удаления файла");
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Ошибка на сервере: " + ex.Message);
        }
    }
}
