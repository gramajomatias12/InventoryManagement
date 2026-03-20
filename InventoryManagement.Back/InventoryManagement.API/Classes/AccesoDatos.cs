using Microsoft.Data.SqlClient;
using System.Text;
using InventoryManagement.API.Models;

namespace InventoryManagement.API.Classes
{
    public class AccesoDatos
    {
        private readonly IConfiguration _configuration;
        public AccesoDatos(IConfiguration configuration) => _configuration = configuration;

        public Respuesta Consultar(string spNombre, string jsonParametros)
        {
            try
            {
                string connString = _configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found."); 
                using SqlConnection connection = new(connString);
                connection.Open();

                // Formato: Nombre_SP @parametro
                string sql = $"{spNombre} @jsParametro";
                using SqlCommand command = new(sql, connection);
                command.Parameters.AddWithValue("@jsParametro", jsonParametros);

                using SqlDataReader reader = command.ExecuteReader();
                StringBuilder sb = new();
                while (reader.Read())
                {
                    sb.Append(reader.GetString(0));
                }

                return new Respuesta { Items = sb.ToString() };
            }
            catch (Exception ex)
            {
                return new Respuesta { isException = true, mensaje = ex.Message };
            }
        }
    }
}
