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
            return Consultar(spNombre, jsonParametros, string.Empty, string.Empty, string.Empty);
        }

        public Respuesta Consultar(string spNombre, string jsonParametros, string uiSesion, string ip, string userAgent)
        {
            try
            {
                string connString = _configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found."); 
                using SqlConnection connection = new(connString);
                connection.Open();

                string sql = BuildProcedureCall(connection, spNombre);
                using SqlCommand command = new(sql, connection);
                command.Parameters.AddWithValue("@jsParametro", jsonParametros);

                AddOptionalParameter(connection, command, spNombre, "@uiSesion", uiSesion);
                AddOptionalParameter(connection, command, spNombre, "@ip", ip);
                AddOptionalParameter(connection, command, spNombre, "@userAgent", userAgent);

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

        private static string BuildProcedureCall(SqlConnection connection, string spNombre)
        {
            var parametros = new List<string> { "@jsParametro=@jsParametro" };

            if (ProcedureHasParameter(connection, spNombre, "@uiSesion")) parametros.Add("@uiSesion=@uiSesion");
            if (ProcedureHasParameter(connection, spNombre, "@ip")) parametros.Add("@ip=@ip");
            if (ProcedureHasParameter(connection, spNombre, "@userAgent")) parametros.Add("@userAgent=@userAgent");

            return $"{spNombre} {string.Join(", ", parametros)}";
        }

        private static void AddOptionalParameter(SqlConnection connection, SqlCommand command, string spNombre, string parameterName, string value)
        {
            if (ProcedureHasParameter(connection, spNombre, parameterName))
            {
                command.Parameters.AddWithValue(parameterName, value ?? string.Empty);
            }
        }

        private static bool ProcedureHasParameter(SqlConnection connection, string spNombre, string parameterName)
        {
            var procedureName = spNombre.Contains('.') ? spNombre.Split('.').Last() : spNombre;

            const string query = @"
                SELECT 1
                FROM sys.parameters p
                INNER JOIN sys.objects o ON p.object_id = o.object_id
                WHERE o.type = 'P'
                  AND o.name = @spName
                  AND p.name = @paramName";

            using var metadataCommand = new SqlCommand(query, connection);
            metadataCommand.Parameters.AddWithValue("@spName", procedureName);
            metadataCommand.Parameters.AddWithValue("@paramName", parameterName);

            var result = metadataCommand.ExecuteScalar();
            return result != null;
        }
    }
}
