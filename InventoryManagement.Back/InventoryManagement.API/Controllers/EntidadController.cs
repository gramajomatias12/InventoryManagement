using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text.Json.Nodes;
using InventoryManagement.API.Classes; // Asegurate que acá esté tu clase AccesoDatos/Io
using InventoryManagement.API.Models;

namespace InventoryManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EntidadController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public EntidadController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        // 1. GET Genérico (Listado)
        [HttpGet("{entidad}")]
        public object Get(string entidad)
        {
            AccesoDatos db = new(_configuration);
            var sessionContext = GetSessionContext();
            
            // Construye: SIS_Usuarios_S o PAT_Categorias_S según el Header "Sistema"
            string spNombre = GetSistemaPrefix() + "_" + entidad + "_S";

            Respuesta respuesta = db.Consultar(
                spNombre,
                "{}",
                sessionContext.UiSesion,
                sessionContext.Ip,
                sessionContext.UserAgent
            );

            if (respuesta.isException) return BadRequest(respuesta.mensaje);

            return JsonSerializer.Deserialize<Object>(respuesta.Items) ?? "[]";
        }

        // 2. GET con Parámetro (Filtro o ID)
        [HttpGet("{entidad}/{param}")]
        public object Get(string entidad, string param)
        {
            AccesoDatos db = new(_configuration);
            var sessionContext = GetSessionContext();
            string spNombre = GetSistemaPrefix() + "_" + entidad + "_S";

            Respuesta respuesta = db.Consultar(
                spNombre,
                param,
                sessionContext.UiSesion,
                sessionContext.Ip,
                sessionContext.UserAgent
            );

            if (respuesta.isException) return BadRequest(respuesta.mensaje);

            return JsonSerializer.Deserialize<Object>(respuesta.Items) ?? "[]";
        }

        // 3. POST Genérico (Insert/Update)
        [HttpPost("{entidad}")]
        public object Post(string entidad, [FromBody] PeticionGenerica data)
        {
            var sessionContext = GetSessionContext();

            // --- CAPA DE SEGURIDAD PARA USUARIOS ---
            if (entidad.Equals("Usuarios", StringComparison.OrdinalIgnoreCase))
            {
                data.jsonParametros = ProcesarPassword(data.jsonParametros);
            }

            AccesoDatos db = new(_configuration);
            
            // Construye: SIS_Usuarios_IU o PAT_Categorias_IU
            string spNombre = GetSistemaPrefix() + "_" + entidad + "_IU";

            Respuesta respuesta = db.Consultar(
                spNombre,
                data.jsonParametros,
                sessionContext.UiSesion,
                sessionContext.Ip,
                sessionContext.UserAgent
            );

            if (respuesta.isException)
            {
                return BadRequest(new { mensaje = respuesta.mensaje, error = true });
            }

            return respuesta.Items; // Retorna el JSON que viene de SQL
        }

        // --- MÉTODOS AUXILIARES ---

        private string GetSistemaPrefix()
        {
            // Intentamos leer el prefijo desde un Header (como hacés en el laburo)
            // Si no viene, usamos "ADM" por defecto
            var headerSistema = Request.Headers["Sistema"].ToString();
            return !string.IsNullOrEmpty(headerSistema) ? headerSistema : "ADM";
        }

        private string ProcesarPassword(string json)
        {
            var nodoJson = JsonNode.Parse(json);
            if (nodoJson != null && nodoJson["dsPassword"] != null)
            {
                string pass = nodoJson["dsPassword"]!.ToString();
                if (!string.IsNullOrEmpty(pass))
                    nodoJson["dsPassword"] = BCrypt.Net.BCrypt.HashPassword(pass);
                else
                    nodoJson.AsObject().Remove("dsPassword");
                
                return nodoJson.ToJsonString();
            }
            return json;
        }

        private SessionContext GetSessionContext()
        {
            var forwardedFor = Request.Headers["X-Forwarded-For"].ToString();
            var ip = !string.IsNullOrWhiteSpace(forwardedFor)
                ? forwardedFor.Split(',')[0].Trim()
                : HttpContext.Connection.RemoteIpAddress?.ToString() ?? string.Empty;

            var userAgent = Request.Headers["User-Agent"].ToString();

            var uiSesion = Request.Headers["X-Session-Id"].ToString();
            if (string.IsNullOrWhiteSpace(uiSesion))
            {
                uiSesion = Request.Headers["uiSesion"].ToString();
            }

            return new SessionContext
            {
                UiSesion = uiSesion,
                Ip = ip,
                UserAgent = userAgent,
            };
        }

        private sealed class SessionContext
        {
            public string UiSesion { get; init; } = string.Empty;
            public string Ip { get; init; } = string.Empty;
            public string UserAgent { get; init; } = string.Empty;
        }
    }
}