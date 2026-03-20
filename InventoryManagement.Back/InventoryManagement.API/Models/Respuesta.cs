namespace InventoryManagement.API.Models
{
    public class Respuesta
    {
        public bool isException { get; set; } = false;
        public string mensaje { get; set; } = "";
        public string Items { get; set; } = ""; // Aquí irá el JSON de SQL
    }
}
