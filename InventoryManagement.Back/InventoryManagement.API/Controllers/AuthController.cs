using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using InventoryManagement.API.Classes;
using InventoryManagement.API.Models;
using System.Text.Json; // Para manejar el body que llega de Angular
using BCrypt.Net;

namespace InventoryManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly TokenService _tokenService;

        public AuthController(IConfiguration configuration, TokenService tokenService)
        {
            _configuration = configuration;
            _tokenService = tokenService;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] JsonElement data)
        {
            string jsonParametros = data.GetRawText();
            string passwordIngresada = data.GetProperty("dsContraseña").GetString()!;
            AccesoDatos db = new(_configuration);

            // Ejecutamos el SP
            Respuesta res = db.Consultar("Auth_Login", jsonParametros);

            if (res.isException) return BadRequest(res.mensaje);

            // Si res.Items viene vacío (null o string vacío), el login falló
            if (res.Items == null || string.IsNullOrEmpty(res.Items.ToString()))
                return BadRequest("Usuario o contraseña incorrectos");

            // IMPORTANTE: SQL devuelve un string JSON. 
            // Lo convertimos en un objeto real para que .NET no lo mande como "texto con comillas"
            var usuarioObj = JsonDocument.Parse(res.Items.ToString()!).RootElement;
            string hashDeLaBase = usuarioObj.GetProperty("dsContraseña").GetString()!;

            //BCrypt compara la clave plana con el Hash
            bool esValida = BCrypt.Net.BCrypt.Verify(passwordIngresada, hashDeLaBase);

            if (!esValida) {
                return BadRequest("Contraseña incorrecta");
            }
            
            // Generamos el token (usando los datos del objeto que acabamos de parsear)
            string login = usuarioObj.GetProperty("dsLogin").GetString()!;
            string rol = usuarioObj.GetProperty("dsRol").GetString()!;

            string token = _tokenService.GenerarToken(login, rol);

            return Ok(new
            {
                token = token,
                usuario = usuarioObj // Mandamos el objeto limpio
            });
        }
    }
}