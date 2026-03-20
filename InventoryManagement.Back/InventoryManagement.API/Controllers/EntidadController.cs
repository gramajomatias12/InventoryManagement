using Microsoft.AspNetCore.Mvc;
using InventoryManagement.API.Classes;
using InventoryManagement.API.Models;
using System.Text.Json.Nodes;
using BCrypt.Net;

namespace InventoryManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EntidadController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        public EntidadController(IConfiguration configuration) => _configuration = configuration;

        [HttpGet("{entidad}")]
        public IActionResult Get(string entidad)
        {
            AccesoDatos db = new(_configuration);
            // Simula la nomenclatura de tu trabajo: SIS_Objeto_S
            Respuesta res = db.Consultar("SIS_" + entidad + "_S", "{}");

            if (res.isException) return BadRequest(res.mensaje);
            return Ok(res.Items);
        }


        [HttpPost("{entidad}")]
        public IActionResult Post(string entidad, [FromBody] PeticionGenerica data)
        {
            // 1. ATAJAMOS SI ES USUARIOS PARA HASHEAR LA CLAVE
            if (entidad.Equals("Usuarios", StringComparison.OrdinalIgnoreCase))
            {
                // Parseamos el string JSON a un nodo dinámico
                var nodoJson = JsonNode.Parse(data.jsonParametros);

                // Verificamos si en el JSON mandaron el campo 'dsPassword'
                if (nodoJson != null && nodoJson["dsPassword"] != null)
                {
                    string passPlana = nodoJson["dsPassword"]!.ToString();

                    // Solo hasheamos si no está vacía (por si es una edición donde no cambian clave)
                    if (!string.IsNullOrEmpty(passPlana))
                    {
                        // Magia: Reemplazamos la clave plana por el Hash
                        nodoJson["dsPassword"] = BCrypt.Net.BCrypt.HashPassword(passPlana);
                    }
                    else
                    {
                        // Si la clave viene vacía, la removemos del JSON para que el SP no intente actualizarla
                        nodoJson.AsObject().Remove("dsPassword");
                    }

                    // Guardamos el JSON modificado de nuevo en la petición original
                        data.jsonParametros = nodoJson.ToJsonString();
                }
                else
                {
                    Console.WriteLine("ERROR: No se encontró 'dsPassword' en el JSON");
                }
            }

            // 2. SIGUE EL FLUJO NORMAL PARA CUALQUIER ENTIDAD
            AccesoDatos db = new(_configuration);

            string sufijo = entidad.Contains("_") ? "" : "_IU";
            string nombreSP = "SIS_" + entidad + sufijo;
          
            Respuesta res = db.Consultar(nombreSP, data.jsonParametros);
            return Ok(res);
        }
    }
}
