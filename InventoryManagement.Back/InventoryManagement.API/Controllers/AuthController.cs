using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using InventoryManagement.API.Classes;
using InventoryManagement.API.Models;
using System.Text.Json; // Para manejar el body que llega de Angular
using System.Text.Json.Nodes;
using BCrypt.Net;

namespace InventoryManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly TokenService _tokenService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IConfiguration configuration, TokenService tokenService, ILogger<AuthController> logger)
        {
            _configuration = configuration;
            _tokenService = tokenService;
            _logger = logger;
        }

        [HttpPost("logout")]
        public IActionResult Logout([FromBody] JsonElement data)
        {
            AccesoDatos db = new(_configuration);

            string? sesionGuid = null;
            if (data.TryGetProperty("sesion", out var sesionProp))
            {
                sesionGuid = sesionProp.GetString();
            }

            if (string.IsNullOrWhiteSpace(sesionGuid))
            {
                return BadRequest("El campo 'sesion' es requerido.");
            }

            var payload = new JsonObject
            {
                ["sesion"] = sesionGuid,
                ["motivo"] = "logout"
            };

            Respuesta res = db.Consultar("AUTH_CerrarSesion_IU", payload.ToJsonString());

            if (res.isException)
            {
                _logger.LogWarning("Error cerrando sesion AUTH. sesion={Sesion} mensaje={Mensaje}", sesionGuid, res.mensaje);
                // No bloqueamos el logout del lado cliente aunque falle en DB
                return Ok(new { mensaje = "Sesion cerrada (sin confirmacion DB)" });
            }

            return Ok(new { mensaje = "Sesion cerrada correctamente" });
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] JsonElement data)
        {
            string sistemaPrefijo = GetSistemaPrefix();
            string jsonParametros = BuildLoginPayload(data, sistemaPrefijo);
            string passwordIngresada = GetPasswordIngresada(data);
            AccesoDatos db = new(_configuration);

            // Ejecutamos el SP del sistema actual, con fallback al login comun.
            Respuesta res = EjecutarLogin(db, sistemaPrefijo, jsonParametros);

            if (res.isException) return BadRequest(res.mensaje);

            // Si res.Items viene vacío (null o string vacío), el login falló
            if (res.Items == null || string.IsNullOrEmpty(res.Items.ToString()))
                return BadRequest("Usuario o contraseña incorrectos");

            JsonObject usuario = ResolveLoginResult(res.Items.ToString()!);

            if (IsExceptionResult(usuario, out string mensajeError))
            {
                return BadRequest(mensajeError);
            }

            string? hashDeLaBase = GetString(usuario, "dsContraseña", "passwordHash", "hash");

            // Si el SP devuelve hash, validamos en backend con BCrypt.
            // Si no lo devuelve, asumimos compatibilidad con SPs legacy que ya validan internamente.
            if (!string.IsNullOrWhiteSpace(hashDeLaBase))
            {
                bool esValida = BCrypt.Net.BCrypt.Verify(passwordIngresada, hashDeLaBase);

                if (!esValida)
                {
                    RegistrarIntentoFallidoPassword(db, sistemaPrefijo, data, usuario);
                    return BadRequest("Contraseña incorrecta");
                }
            }
            
            string login = GetString(usuario, "dsLogin", "login") ?? string.Empty;
            string perfil = ResolvePerfil(usuario);
            int? cdSistema = GetInt(usuario, "cdSistema", "idSistema") ?? GetInputSystem(data);

            usuario["dsLogin"] = login;
            usuario["dsPerfil"] = perfil;

            if (cdSistema.HasValue)
            {
                usuario["cdSistema"] = cdSistema.Value;
            }

            string? cdUsuarioLegacy = GetString(usuario, "usuario");
            if (GetInt(usuario, "cdUsuario") is null && int.TryParse(cdUsuarioLegacy, out var cdUsuarioValue))
            {
                usuario["cdUsuario"] = cdUsuarioValue;
            }

            if (usuario["dsPrefijo"] is null)
            {
                usuario["dsPrefijo"] = sistemaPrefijo;
            }

            string? sesionGenerada = RegistrarSesionLoginOk(db, sistemaPrefijo, usuario, data);
            if (!string.IsNullOrWhiteSpace(sesionGenerada))
            {
                usuario["sesion"] = sesionGenerada;
            }

            string token = _tokenService.GenerarToken(login, perfil, cdSistema);

            return Ok(new
            {
                token = token,
                usuario = JsonDocument.Parse(usuario.ToJsonString()).RootElement
            });
        }

        private Respuesta EjecutarLogin(AccesoDatos db, string sistemaPrefijo, string jsonParametros)
        {
            string prefijo = string.IsNullOrWhiteSpace(sistemaPrefijo) ? "ADM" : sistemaPrefijo.Trim().ToUpperInvariant();
            string procedureName = $"{prefijo}_Login";

            Respuesta respuesta = db.Consultar(procedureName, jsonParametros);

            if (!respuesta.isException)
            {
                return respuesta;
            }

            if (IsMissingStoredProcedure(respuesta.mensaje))
            {
                return new Respuesta
                {
                    isException = true,
                    mensaje = $"No existe el procedimiento de login del sistema '{prefijo}'. Debes crear '{procedureName}'."
                };
            }

            return respuesta;
        }

        private string BuildLoginPayload(JsonElement data, string sistemaPrefijo)
        {
            JsonObject payload = JsonNode.Parse(data.GetRawText())?.AsObject() ?? new JsonObject();

            string? dsLogin = payload["dsLogin"]?.GetValue<string>();
            string? dsPassword = payload["dsContraseña"]?.GetValue<string>();
            int? cdSistema = payload["cdSistema"]?.GetValue<int?>() ?? payload["idSistema"]?.GetValue<int?>();

            payload["dsLogin"] = dsLogin;
            payload["cuenta"] = dsLogin;
            payload["dsContraseña"] = dsPassword;
            payload["password"] = dsPassword;
            payload["cdSistema"] = cdSistema;
            payload["idSistema"] = cdSistema;
            payload["modulo"] = sistemaPrefijo;
            payload["ip"] = GetRemoteIp();
            payload["userAgent"] = Request.Headers.UserAgent.ToString();
            payload["session"] = Request.Headers["X-Session-Id"].ToString();

            return payload.ToJsonString();
        }

        private string GetPasswordIngresada(JsonElement data)
        {
            if (data.TryGetProperty("dsContraseña", out var passwordProp))
            {
                return passwordProp.GetString() ?? string.Empty;
            }

            if (data.TryGetProperty("password", out var legacyPasswordProp))
            {
                return legacyPasswordProp.GetString() ?? string.Empty;
            }

            return string.Empty;
        }

        private int? GetInputSystem(JsonElement data)
        {
            if (data.TryGetProperty("cdSistema", out var sistemaProp) && sistemaProp.ValueKind == JsonValueKind.Number)
            {
                return sistemaProp.GetInt32();
            }

            if (data.TryGetProperty("idSistema", out var idSistemaProp) && idSistemaProp.ValueKind == JsonValueKind.Number)
            {
                return idSistemaProp.GetInt32();
            }

            return null;
        }

        private string GetSistemaPrefix()
        {
            var headerSistema = Request.Headers["Sistema"].ToString();
            return !string.IsNullOrWhiteSpace(headerSistema) ? headerSistema : "ADM";
        }

        private string GetRemoteIp()
        {
            string? forwardedFor = Request.Headers["X-Forwarded-For"].ToString();
            if (!string.IsNullOrWhiteSpace(forwardedFor))
            {
                return forwardedFor.Split(',')[0].Trim();
            }

            return HttpContext.Connection.RemoteIpAddress?.ToString() ?? string.Empty;
        }

        private static bool IsMissingStoredProcedure(string? mensaje)
        {
            if (string.IsNullOrWhiteSpace(mensaje))
            {
                return false;
            }

            return mensaje.Contains("Could not find stored procedure", StringComparison.OrdinalIgnoreCase)
                || mensaje.Contains("no se pudo encontrar el procedimiento almacenado", StringComparison.OrdinalIgnoreCase);
        }

        private static JsonObject ResolveLoginResult(string rawJson)
        {
            JsonNode? node = JsonNode.Parse(rawJson);

            if (node is JsonObject obj)
            {
                return obj;
            }

            if (node is JsonArray array && array.Count > 0 && array[0] is JsonObject arrayObj)
            {
                return arrayObj;
            }

            return new JsonObject();
        }

        private static bool IsExceptionResult(JsonObject usuario, out string mensaje)
        {
            mensaje = GetString(usuario, "mensaje") ?? "No se pudo iniciar sesion.";
            bool isException = GetBool(usuario, "isException", "error");
            return isException;
        }

        private static string ResolvePerfil(JsonObject usuario)
        {
            string? dsPerfil = GetString(usuario, "dsPerfil");
            if (!string.IsNullOrWhiteSpace(dsPerfil))
            {
                return dsPerfil;
            }

            if (usuario["perfiles"] is JsonArray perfiles && perfiles.Count > 0)
            {
                JsonObject? perfilObj = perfiles[0] as JsonObject;
                string? nombre = GetString(perfilObj, "nombre", "dsPerfil");
                if (!string.IsNullOrWhiteSpace(nombre))
                {
                    return nombre;
                }
            }

            return "USER";
        }

        private static bool ResolveIsAdmin(JsonObject usuario)
        {
            if (GetBool(usuario, "isAdmin"))
            {
                return true;
            }

            string dsRol = GetString(usuario, "dsRol") ?? string.Empty;
            if (dsRol.Contains("ADMIN", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            if (usuario["roles"] is JsonArray rolesArray)
            {
                return RolesContainAdmin(rolesArray);
            }

            string? rolesRaw = GetString(usuario, "roles");
            if (!string.IsNullOrWhiteSpace(rolesRaw))
            {
                try
                {
                    JsonNode? rolesNode = JsonNode.Parse(rolesRaw);
                    if (rolesNode is JsonArray rolesParsed)
                    {
                        return RolesContainAdmin(rolesParsed);
                    }
                }
                catch
                {
                    return rolesRaw.Contains("ADMIN", StringComparison.OrdinalIgnoreCase);
                }
            }

            return false;
        }

        private static bool RolesContainAdmin(JsonArray roles)
        {
            foreach (JsonNode? node in roles)
            {
                if (node is JsonObject roleObj)
                {
                    string? rol = GetString(roleObj, "rol", "dsRol", "nombre");
                    if (!string.IsNullOrWhiteSpace(rol) && rol.Contains("ADMIN", StringComparison.OrdinalIgnoreCase))
                    {
                        return true;
                    }
                }
                else if (node is JsonValue value)
                {
                    string? rol = value.TryGetValue<string>(out var rolTexto) ? rolTexto : null;
                    if (!string.IsNullOrWhiteSpace(rol) && rol.Contains("ADMIN", StringComparison.OrdinalIgnoreCase))
                    {
                        return true;
                    }
                }
            }

            return false;
        }

        private static string? GetString(JsonObject? obj, params string[] keys)
        {
            if (obj is null)
            {
                return null;
            }

            foreach (string key in keys)
            {
                if (obj[key] is JsonValue value && value.TryGetValue<string>(out var text))
                {
                    return text;
                }
            }

            return null;
        }

        private static int? GetInt(JsonObject? obj, params string[] keys)
        {
            if (obj is null)
            {
                return null;
            }

            foreach (string key in keys)
            {
                if (obj[key] is JsonValue value)
                {
                    if (value.TryGetValue<int>(out var intValue))
                    {
                        return intValue;
                    }

                    if (value.TryGetValue<string>(out var textValue) && int.TryParse(textValue, out var parsed))
                    {
                        return parsed;
                    }
                }
            }

            return null;
        }

        private static bool GetBool(JsonObject? obj, params string[] keys)
        {
            if (obj is null)
            {
                return false;
            }

            foreach (string key in keys)
            {
                if (obj[key] is JsonValue value)
                {
                    if (value.TryGetValue<bool>(out var boolValue))
                    {
                        return boolValue;
                    }

                    if (value.TryGetValue<int>(out var intValue))
                    {
                        return intValue == 1;
                    }

                    if (value.TryGetValue<string>(out var textValue))
                    {
                        if (bool.TryParse(textValue, out var parsedBool))
                        {
                            return parsedBool;
                        }

                        if (int.TryParse(textValue, out var parsedInt))
                        {
                            return parsedInt == 1;
                        }
                    }
                }
            }

            return false;
        }

        private string? RegistrarSesionLoginOk(AccesoDatos db, string sistemaPrefijo, JsonObject usuario, JsonElement requestData)
        {
            try
            {
                int? cdUsuario = GetInt(usuario, "cdUsuario")
                                 ?? (int.TryParse(GetString(usuario, "usuario"), out var id) ? id : null);
                int? cdSistema = GetInt(usuario, "cdSistema", "idSistema") ?? GetInputSystem(requestData);

                if (!cdUsuario.HasValue || !cdSistema.HasValue)
                {
                    return null;
                }

                var payload = new JsonObject
                {
                    ["cdUsuario"] = cdUsuario.Value,
                    ["cdSistema"] = cdSistema.Value,
                    ["ip"] = GetRemoteIp(),
                    ["userAgent"] = Request.Headers.UserAgent.ToString(),
                    ["session"] = Request.Headers["X-Session-Id"].ToString(),
                    ["modulo"] = sistemaPrefijo
                };

                Respuesta auditRes = db.Consultar("AUTH_RegistrarSesion_IU", payload.ToJsonString());
                if (auditRes.isException || string.IsNullOrWhiteSpace(auditRes.Items))
                {
                    _logger.LogWarning("No se pudo registrar sesion AUTH. isException={IsException} mensaje={Mensaje}", auditRes.isException, auditRes.mensaje);
                    return null;
                }

                JsonObject result = ResolveLoginResult(auditRes.Items);
                return GetString(result, "sesion");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inesperado registrando sesion AUTH");
                return null;
            }
        }

        private void RegistrarIntentoFallidoPassword(AccesoDatos db, string sistemaPrefijo, JsonElement requestData, JsonObject usuario)
        {
            try
            {
                string login = GetString(usuario, "dsLogin", "login")
                               ?? (requestData.TryGetProperty("dsLogin", out var dsLoginProp) ? dsLoginProp.GetString() : null)
                               ?? string.Empty;

                int? cdUsuario = GetInt(usuario, "cdUsuario")
                                 ?? (int.TryParse(GetString(usuario, "usuario"), out var id) ? id : null);

                var payload = new JsonObject
                {
                    ["cdSesion"] = null,
                    ["dsProcedimiento"] = $"{sistemaPrefijo}:login.password_fail",
                    ["dsDocumento"] = new JsonArray
                    {
                        new JsonObject
                        {
                            ["usuario"] = login,
                            ["cdUsuario"] = cdUsuario,
                            ["ip"] = GetRemoteIp(),
                            ["userAgent"] = Request.Headers.UserAgent.ToString(),
                            ["motivo"] = "Password inválida"
                        }
                    }.ToJsonString()
                };

                db.Consultar("AUTH_LogAcceso_IU", payload.ToJsonString());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registrando intento fallido de password");
            }
        }
    }
}